require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const { connectDatabase } = require('./config/db');
const { isEmailSendingConfigured, sendResetPasswordEmail, sendVerificationEmail } = require('./services/emailService');
const {
  createUser,
  findUserByEmail,
  resetPasswordWithToken,
  saveEmailVerificationToken,
  saveResetPasswordToken,
  updateUserProfile,
  verifyEmailWithToken,
  verifyPassword,
} = require('./repositories/userRepository');

const app = express();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getFrontendBaseUrl = (req) => {
  const configuredBaseUrl = process.env.FRONTEND_URL;

  if (req?.headers?.host) {
    const forwardedProto = req.headers['x-forwarded-proto'];
    const protocol = forwardedProto || req.protocol || 'http';
    const requestHost = req.headers.host.replace(/:\d+$/, ':3000');

    if (!configuredBaseUrl || configuredBaseUrl.includes('localhost')) {
      return `${protocol}://${requestHost}`;
    }
  }

  return configuredBaseUrl || 'http://localhost:3000';
};

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Kerv Sales Demo API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({
    message: 'Kerv Sales Demo API is running',
    mongoConnected: require('mongoose').connection.readyState === 1,
    database: 'kerv-sales-demo',
    collection: 'users',
  });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const user = await createUser({ name, email, password, emailVerified: false });
    return res.status(201).json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to register user right now.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await verifyPassword(email, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password. Try the KERV demo account or register a new user.' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to log in right now.' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'We could not find an account with that email.' });
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    const resetExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
    await saveResetPasswordToken(email, resetToken, resetExpiresAt);
    const resetLink = `${getFrontendBaseUrl(req)}/reset-password?token=${encodeURIComponent(resetToken)}`;
    let emailSent = false;
    let emailError = '';

    try {
      emailSent = await sendResetPasswordEmail({
        to: user.email,
        resetLink,
        expiresAt: resetExpiresAt.toISOString(),
      });
    } catch (mailError) {
      emailError = mailError.message;
      console.error(`Reset email send failed for ${user.email}: ${mailError.message}`);
    }

    return res.json({
      message: emailSent
        ? 'Password reset link sent to your email successfully.'
        : emailError || 'We could not send the email right now. Use the generated reset link below.',
      emailSent,
      emailError,
      resetLink: emailSent ? null : resetLink,
      expiresAt: resetExpiresAt.toISOString(),
      smtpConfigured: isEmailSendingConfigured(),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to generate a reset link right now.' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Reset token and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await resetPasswordWithToken(token, password);
    if (!user) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    }

    return res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to reset the password right now.' });
  }
});

app.patch('/api/users/profile', async (req, res) => {
  try {
    const { currentEmail, name, email, organization, access } = req.body;

    if (!currentEmail || !name || !email) {
      return res.status(400).json({ message: 'Current email, name, and email are required.' });
    }

    const normalizedCurrentEmail = currentEmail.trim().toLowerCase();
    const normalizedNextEmail = email.trim().toLowerCase();
    const existingUserWithEmail = await findUserByEmail(email);

    if (existingUserWithEmail && existingUserWithEmail.email !== normalizedCurrentEmail) {
      return res.status(409).json({ message: 'That email is already being used by another account.' });
    }

    const emailChanged = normalizedCurrentEmail !== normalizedNextEmail;
    const user = await updateUserProfile(currentEmail, {
      name,
      email,
      organization,
      access,
      emailVerified: !emailChanged,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update the profile right now.' });
  }
});

app.post('/api/users/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'We could not find an account with that email.' });
    }

    const verificationToken = crypto.randomBytes(24).toString('hex');
    const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await saveEmailVerificationToken(email, verificationToken, verificationExpiresAt);
    const verificationLink = `${getFrontendBaseUrl(req)}/verify-email?token=${encodeURIComponent(verificationToken)}`;
    let emailSent = false;

    try {
      emailSent = await sendVerificationEmail({
        to: user.email,
        verificationLink,
        expiresAt: verificationExpiresAt.toISOString(),
      });
    } catch (mailError) {
      console.error(`Verification email send failed for ${user.email}: ${mailError.message}`);
    }

    return res.json({
      message: emailSent
        ? `Verification email re-sent to ${email}.`
        : 'We could not send the verification email right now. Use the generated verification link below.',
      emailSent,
      verificationLink: emailSent ? null : verificationLink,
      smtpConfigured: isEmailSendingConfigured(),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to resend verification email right now.' });
  }
});

app.post('/api/users/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const user = await verifyEmailWithToken(token);
    if (!user) {
      return res.status(400).json({ message: 'This verification link is invalid or has expired.' });
    }

    return res.json({ message: 'Email verified successfully.', user });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to verify email right now.' });
  }
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  app.listen(PORT, HOST, () => console.log(`Server running on http://${HOST}:${PORT}`));

  connectDatabase().catch((error) => {
    console.error(`Database startup error: ${error.message}`);
  });
}

startServer();
