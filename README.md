# MealMate — Mess Management System

MealMate is a modern full-stack web application designed for student mess management, daily meal attendance tracking, billing calculations, and mess expense management.

## Tech Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MySQL (`mysql2/promise`)

---

## Getting Started on Windows

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- MySQL Server (e.g., MySQL 8.0 or XAMPP)

### 2. Backend Setup
```powershell
cd backend
npm install
Copy-Item .env.example .env
# Edit .env with your MySQL credentials
npm run dev
```
Backend runs at: `http://localhost:5000`

### 3. Frontend Setup
```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```
Frontend runs at: `http://localhost:5173`

### 4. Database Initialization
Once MySQL is running, import `database/schema.sql`:
```powershell
mysql -u root -p mealmate_db < database/schema.sql
```
*(Or execute the script inside MySQL Workbench)*
