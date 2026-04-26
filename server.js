require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();

app.use(cors({
  origin: 'https://taskmanager-frontend-6z0khyo58-mumerbscs23seecs-projects.vercel.app'
}));
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

console.log("Server started");

// ---------------- AUTH MIDDLEWARE ----------------
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: 'No token' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ---------------- ROUTES ----------------
app.get('/', (req, res) => {
  res.send('API is running');
});

// GET TASKS
app.get('/tasks', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE TASK
app.post('/tasks', auth, async (req, res) => {
  try {
    const { title } = req.body;

    const result = await pool.query(
      'INSERT INTO tasks (title, user_id) VALUES ($1, $2) RETURNING *',
      [title, req.user.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE TASK (FIXED - secure)
app.delete('/tasks/:id', auth, async (req, res) => {
  try {
    await pool.query(
    'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.userId]
  );

  res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// TOGGLE TASK
app.patch('/tasks/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE tasks SET done = NOT done WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// REGISTER
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hash]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'User already exists or server error' });
  }
});

// LOGIN
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------------- START SERVER ----------------
app.listen(3000, () => {
  console.log('Server running on port 3000');
});