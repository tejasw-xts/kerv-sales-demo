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

const normalizeUser = (user) => ({
  name: user.name.trim(),
  email: user.email.trim().toLowerCase(),
  organization: user.organization || 'Warner Bro.',
  access: user.access || ['Search Tool'],
  emailVerified: user.emailVerified ?? true,
});

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
    organization: userData.organization || 'Warner Bro.',
    access: userData.access || ['Search Tool'],
    emailVerified: userData.emailVerified ?? true,
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
      body: JSON.stringify(userData),
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
    return data.message;
  } catch (error) {
    if (!isNetworkFailure(error) || !ENABLE_LOCAL_FALLBACK) {
      throw error;
    }

    return `Verification email re-sent to ${email}.`;
  }
};
