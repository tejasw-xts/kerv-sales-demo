const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');

const dataDir = path.join(__dirname, '..', '..', 'data');
const usersFile = path.join(dataDir, 'users.json');

const defaultUsers = [
  {
    name: 'KERV Sales Rep',
    email: 'sales@kerv.com',
    password: 'Demo@123',
    organization: 'Warner Bro.',
    access: ['Search Tool'],
    emailVerified: true,
  },
];

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

async function ensureUsersFile() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(usersFile);
  } catch (error) {
    await fs.writeFile(usersFile, JSON.stringify(defaultUsers, null, 2));
  }
}

async function readUsers() {
  await ensureUsersFile();
  const contents = await fs.readFile(usersFile, 'utf8');
  return JSON.parse(contents);
}

async function writeUsers(users) {
  await ensureUsersFile();
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
}

function useMongo() {
  return mongoose.connection.readyState === 1;
}

async function findUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (useMongo()) {
    return User.findOne({ email: normalizedEmail }).lean();
  }

  const users = await readUsers();
  return users.find((user) => user.email.toLowerCase() === normalizedEmail) || null;
}

async function createUser(userData) {
  const normalizedUser = {
    name: userData.name.trim(),
    email: userData.email.trim().toLowerCase(),
    password: userData.password,
    organization: userData.organization || 'Warner Bro.',
    access: userData.access || ['Search Tool'],
    emailVerified: userData.emailVerified ?? true,
  };

  if (useMongo()) {
    const user = await User.create(normalizedUser);
    return sanitizeUser(user.toObject());
  }

  const users = await readUsers();
  users.push(normalizedUser);
  await writeUsers(users);
  return sanitizeUser(normalizedUser);
}

async function updateUserProfile(currentEmail, updates) {
  const normalizedCurrentEmail = currentEmail.trim().toLowerCase();
  const nextEmail = updates.email.trim().toLowerCase();

  if (useMongo()) {
    const updatedUser = await User.findOneAndUpdate(
      { email: normalizedCurrentEmail },
      {
        $set: {
          name: updates.name.trim(),
          email: nextEmail,
          organization: updates.organization || 'Warner Bro.',
          access: updates.access || ['Search Tool'],
          emailVerified: updates.emailVerified,
        },
      },
      { new: true }
    ).lean();

    return updatedUser ? sanitizeUser(updatedUser) : null;
  }

  const users = await readUsers();
  const userIndex = users.findIndex((user) => user.email.toLowerCase() === normalizedCurrentEmail);

  if (userIndex === -1) {
    return null;
  }

  users[userIndex] = {
    ...users[userIndex],
    name: updates.name.trim(),
    email: nextEmail,
    organization: updates.organization || users[userIndex].organization || 'Warner Bro.',
    access: updates.access || users[userIndex].access || ['Search Tool'],
    emailVerified: updates.emailVerified,
  };

  await writeUsers(users);
  return sanitizeUser(users[userIndex]);
}

async function verifyPassword(email, password) {
  const user = await findUserByEmail(email);

  if (!user || user.password !== password) {
    return null;
  }

  return sanitizeUser(user);
}

module.exports = {
  createUser,
  findUserByEmail,
  updateUserProfile,
  verifyPassword,
};
