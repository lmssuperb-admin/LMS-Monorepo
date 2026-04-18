# Moodle LMS Monorepo

This project is a decoupled Moodle-based Learning Management System with a modern Next.js frontend and a Node.js API middleware.

## 📁 Project Structure

- **`/frontend`**: Next.js application (The User Interface).
- **`/node-api`**: Node.js/Express service (The Middleware).
- **`/moodle`**: Moodle PHP folder (The Backend/Data Source).

## 🚀 Getting Started

### 1. Installation
Run the following command in the root directory to install dependencies for both the frontend and the API:
```bash
npm install
```

### 2. Configuration
- Go to `node-api/` and configure your `.env` file with the Moodle credentials.
- Go to `frontend/` and configure your `.env.local` if needed.

### 3. Running the Project
You can start both the frontend and the backend API simultaneously using the root command:
```bash
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:5000](http://localhost:5000)

## 🛠 Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS
- **API Middleware:** Node.js, Express
- **LMS Backend:** Moodle (PHP)
