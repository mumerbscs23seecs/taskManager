require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
app.get('/', (req, res) => { res.send('API is running'); });
app.get('/tasks', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM tasks ORDER BY created_at DESC'
  );
  res.json(result.rows);
});

app.post('/tasks', async (req, res) => {
  const { title } = req.body;

  const result = await pool.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title]
  );

  res.status(201).json(result.rows[0]);
});

app.delete('/tasks/:id', async (req, res) => {
  await pool.query(
    'DELETE FROM tasks WHERE id = $1',
    [req.params.id]
  );

  res.json({ message: 'Deleted' });
});

app.listen(3000, () => console.log('Server on port 3000'));