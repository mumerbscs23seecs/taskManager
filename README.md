====  Task Manager (Full Stack App)   =====

A full-stack task management app with authentication, where users can register, login, and manage personal tasks in real time.

🌐 Live Demo

Frontend (Vercel):

https://taskmanager-frontend-bvm6qnqkv-mumerbscs23seecs-projects.vercel.app/

Backend (Railway):

https://taskmanager-production-1971.up.railway.app/

🛠 Tech Stack
Frontend: React (Vite)
Backend: Node.js + Express
Database: PostgreSQL (Supabase)
Auth: JWT (JSON Web Tokens)
Deployment: Vercel + Railway


🏗 Architecture

The frontend (React) sends HTTP requests to the backend API (Node.js + Express).
The backend handles authentication, task logic, and communicates with the PostgreSQL database hosted on Supabase.
The system is fully decoupled, meaning frontend and backend are deployed independently but connected via REST API.

📡 API Reference
Authentication
POST /register → Create new user
POST /login → Login user and return JWT token
Tasks
GET /tasks → Get all tasks (auth required)
POST /tasks → Create new task (auth required)
PATCH /tasks/:id → Toggle task completion (auth required)
DELETE /tasks/:id → Delete task (auth required)

📸 Screenshot
<img width="933" height="942" alt="image" src="https://github.com/user-attachments/assets/20dfc681-fa67-4928-82dc-b2c5e48adecb" />
<img width="867" height="554" alt="image" src="https://github.com/user-attachments/assets/647aedda-deac-4b04-a838-6b70621f45df" />
