require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
console.log("JWT SECRET:", process.env.JWT_SECRET);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
app.get('/', (req, res) => { res.send('API is running'); });
app.get('/tasks', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user.userId]
  );

  res.json(result.rows);
});

app.post('/tasks', auth, async (req, res) => {
  const result = await pool.query(
    'INSERT INTO tasks (title, user_id) VALUES ($1, $2) RETURNING *',
    [req.body.title, req.user.userId]
  );

  res.status(201).json(result.rows[0]);
});

app.delete('/tasks/:id',auth, async (req, res) => {
  await pool.query(
    'DELETE FROM tasks WHERE id = $1',
    [req.params.id]
  );

  res.json({ message: 'Deleted' });
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
    [email, hash]
  );

  res.status(201).json(result.rows[0]);
});

app.post('/login', async (req, res) => {
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
});


app.listen(3000, () => console.log('Server on port 3000'));