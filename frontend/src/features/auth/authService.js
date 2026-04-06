const USERS_KEY = 'kerv_users';
const ENABLE_LOCAL_FALLBACK = process.env.REACT_APP_ENABLE_LOCAL_AUTH_FALLBACK === 'true';

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5000/api`;
  }

  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const DEFAULT_USERS = [
  {
    name: 'KERV Sales Rep',
    email: 'sales@kerv.com',
    password: 'Demo@123',
    role: 'user',
    organization: 'Warner Bro.',
    access: ['Search Tool'],
    emailVerified: true,
  },
];

const loadUsers = () => {
  const storedUsers = JSON.parse(localStorage.getItem(USERS_KEY) || 'null');
  if (storedUsers && storedUsers.length > 0) {
    return storedUsers;
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const parseErrorResponse = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    return data.message || fallbackMessage;
  } catch (error) {
    return fallbackMessage;
  }
};

const isNetworkFailure = (error) => error instanceof TypeError;

const extractUserPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (payload.user && typeof payload.user === 'object') {
    return payload.user;
  }

  return payload;
};

const normalizeUser = (user) => {
  const candidate = extractUserPayload(user);

  if (!candidate?.email) {
    throw new Error('Invalid user response from the KERV Sales Demo auth service.');
  }

  const fallbackName = typeof candidate.username === 'string' ? candidate.username : candidate.email.split('@')[0];

  return {
    name: typeof candidate.name === 'string' && candidate.name.trim() ? candidate.name.trim() : fallbackName,
    email: candidate.email.trim().toLowerCase(),
    role: candidate.role || 'user',
    organization: candidate.organization || 'Warner Bro.',
    access: Array.isArray(candidate.access) && candidate.access.length > 0 ? candidate.access : ['Search Tool'],
    emailVerified: candidate.emailVerified ?? true,
  };
};

const registerUserLocal = (userData) => {
  const users = loadUsers();
  const normalizedEmail = userData.email.trim().toLowerCase();
  const exists = users.find((user) => user.email.toLowerCase() === normalizedEmail);

  if (exists) {
    throw new Error('User already exists.');
  }

  const nextUser = {
    ...userData,
    email: normalizedEmail,
    name: userData.name.trim(),
    role: userData.role || 'user',
    organization: userData.organization || 'Warner Bro.',
    access: userData.access || ['Search Tool'],
    emailVerified: userData.emailVerified ?? false,
  };

  saveUsers([...users, nextUser]);
  return normalizeUser(nextUser);
};

const loginUserLocal = (email, password) => {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((entry) => entry.email.toLowerCase() === normalizedEmail && entry.password === password);

  if (!user) {
    throw new Error('Invalid email or password. Try the KERV demo account or register a new user.');
  }

  return normalizeUser(user);
};

const updateStoredUser = (currentEmail, nextUser) => {
  const normalizedCurrentEmail = currentEmail.trim().toLowerCase();
  const users = loadUsers();
  const updatedUsers = users.map((user) =>
    user.email.toLowerCase() === normalizedCurrentEmail
      ? {
          ...user,
          ...nextUser,
        }
      : user
  );

  saveUsers(updatedUsers);
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
      }),
    });

    if (!response.ok) {
      throw new Error(await parseErrorResponse(response, 'Unable to register user.'));
    }

    const data = await response.json();
    return normalizeUser(data.user);
  } catch (error) {
    if (!isNetworkFailure(error) || !ENABLE_LOCAL_FALLBACK) {
      throw error;
    }

    return registerUserLocal(userData);
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(await parseErrorResponse(response, 'Unable to log in.'));
    }

    const data = await response.json();
    return normalizeUser(data.user);
  } catch (error) {
    if (!isNetworkFailure(error) || !ENABLE_LOCAL_FALLBACK) {
      throw error;
    }

    return loginUserLocal(email, password);
  }
};

export const requestPasswordReset = async (email) => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response, 'Unable to send a password reset link.'));
  }

  const data = await response.json();

  return {
    message: data.message,
    emailError: data.emailError || '',
    resetLink: data.resetLink || '',
    expiresAt: data.expiresAt,
    emailSent: Boolean(data.emailSent),
    smtpConfigured: Boolean(data.smtpConfigured),
  };
};

export const verifyEmailToken = async (token) => {
  const response = await fetch(`${API_BASE_URL}/users/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response, 'Unable to verify the email.'));
  }

  const data = await response.json();
  return {
    message: data.message,
    user: normalizeUser(data.user),
  };
};

export const resetPassword = async ({ token, password }) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response, 'Unable to reset the password.'));
  }

  const data = await response.json();
  return data.message;
};

export const updateUserProfile = async ({ currentEmail, name, email, organization, access }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentEmail, name, email, organization, access }),
    });

    if (!response.ok) {
      throw new Error(await parseErrorResponse(response, 'Unable to update the profile.'));
    }

    const data = await response.json();
    const normalizedUser = normalizeUser(data.user);
    updateStoredUser(currentEmail, normalizedUser);
    return normalizedUser;
  } catch (error) {
    if (!isNetworkFailure(error) || !ENABLE_LOCAL_FALLBACK) {
      throw error;
    }

    const normalizedCurrentEmail = currentEmail.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    const users = loadUsers();
    const emailTaken = users.find(
      (user) => user.email.toLowerCase() === normalizedEmail && user.email.toLowerCase() !== normalizedCurrentEmail
    );

    if (emailTaken) {
      throw new Error('That email is already being used by another account.');
    }

    const emailChanged = normalizedCurrentEmail !== normalizedEmail;
    const updatedUser = {
      name: name.trim(),
      email: normalizedEmail,
      role: 'user',
      organization: organization || 'Warner Bro.',
      access: access || ['Search Tool'],
      emailVerified: !emailChanged,
    };

    updateStoredUser(currentEmail, updatedUser);
    return updatedUser;
  }
};

export const resendVerificationEmail = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(await parseErrorResponse(response, 'Unable to resend verification email.'));
    }

    const data = await response.json();
    return {
      message: data.message,
      verificationLink: data.verificationLink || '',
      emailSent: Boolean(data.emailSent),
      smtpConfigured: Boolean(data.smtpConfigured),
    };
  } catch (error) {
    if (!isNetworkFailure(error) || !ENABLE_LOCAL_FALLBACK) {
      throw error;
    }

    return {
      message: `Verification email re-sent to ${email}.`,
      verificationLink: '',
      emailSent: false,
      smtpConfigured: false,
    };
  }
};
