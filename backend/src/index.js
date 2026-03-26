require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDatabase } = require('./config/db');
const {
  createUser,
  findUserByEmail,
  updateUserProfile,
  verifyPassword,
} = require('./repositories/userRepository');

const app = express();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    const user = await createUser({ name, email, password });
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
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  return res.json({ message: `Verification email re-sent to ${email}.` });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  await connectDatabase();
  app.listen(PORT, HOST, () => console.log(`Server running on http://${HOST}:${PORT}`));
}

startServer();
