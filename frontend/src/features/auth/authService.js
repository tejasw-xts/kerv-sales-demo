// Simulated local storage based auth service
// Replace these with real API calls when backend is ready

const USERS_KEY = 'kerv_users';

export const registerUser = (userData) => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const exists = users.find((u) => u.email === userData.email);
  if (exists) throw new Error('User already exists');
  users.push(userData);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const loginUser = (email, password) => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid email or password');
  return { name: user.name, email: user.email };
};
