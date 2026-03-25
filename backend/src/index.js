// Entry point - Backend server (to be implemented)
// Suggested stack: Node.js + Express + MongoDB/PostgreSQL

const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Kerv Sales Demo API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
