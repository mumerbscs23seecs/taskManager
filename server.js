const express = require('express');
const app = express();
app.use(express.json());
 
let tasks = [];
let nextId = 1;
 
app.get('/tasks', (req, res) => {
  res.json(tasks);
});
 
app.get('/', (req, res) => {
  res.send('API is running');
});
app.post('/tasks', (req, res) => {
  const task = { id: nextId++, title: req.body.title, done: false };
  tasks.push(task);
  res.status(201).json(task);
});
 
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  tasks = tasks.filter(t => t.id !== id);
  res.json({ message: 'Deleted' });
});
 
app.listen(3000, () => console.log('Server running on port 3000'));
