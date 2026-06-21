
# 🧠 Chasfat Academy – Quiz Application

Welcome to the **Chasfat Academy Quiz Platform**, a modern web-based application designed to facilitate quiz and exam creation, student registration, and result analysis. Built with a powerful **React + Redux** frontend and a scalable **Node.js + Prisma + PostgreSQL** backend.

---

## 📦 Project Structure

### 📁 Frontend (`/frontend`)

A modern SPA (Single Page Application) powered by:

- **React (Vite)**
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Formik & React Hook Form** for form handling
- **Zustand** for lightweight local state
- **GraphQL** integration for future scalability

### 📁 Backend (`/backend`)

- **Node.js** with **Express.js**
- **Prisma ORM** for database modeling and type-safe querying
- **PostgreSQL** as the relational database
- **JWT-based Auth**, Role-based Access Control (RBAC)
- **REST API + GraphQL** potential

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/chasfat-quiz-app.git
cd chasfat-quiz-app
````

---

## 🖥️ Frontend Setup

### Navigate to frontend

```bash
cd frontend
npm install
```

### Run in Development

```bash
npm run dev
```

### Tech Stack

* Vite + React
* Redux Toolkit
* React Router
* Zustand
* Tailwind CSS (optional)
* GraphQL client-ready

---

## 🛠 Backend Setup

### Navigate to backend

```bash
cd backend
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/chasfat_db"
JWT_SECRET="your-secret-key"
PORT=5000
```

### Setup Prisma

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Run Development Server

```bash
npm run dev
```

---

## 🌐 API Overview

### Auth Endpoints

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/auth/me`

### Course & Exam Management

* `CRUD /api/courses`
* `CRUD /api/exams`
* `CRUD /api/questions`

### Students

* `GET /api/students`
* `POST /api/students/bulk`

---

## 🧩 Features

### 👤 Admin Panel

* Course & Exam Management
* Bulk Student Registration
* Question Creation (MCQ, image-based, etc.)
* Exam Results & Analytics

### 🎓 Student Portal

* Login & Registration
* Participate in Timed Quizzes
* View Results

### 🔐 Authentication

* Role-based: `admin`, `examiner`, `student`
* JWT Protected Routes

### 📊 Reporting

* Exam Reports
* Student-wise Performance
* Export Options (Coming soon)

---

## 📁 Notable Frontend Modules

* `components/ChasfatAcademy/pages`: Core admin/student pages
* `features/quiz`, `features/exam`, `features/result`: Redux slices
* `components/Basics`: Educational and demo components
* `graphql/`: GraphQL integration with Anilist (for learning or expansion)
* `zustand/`: Lightweight UI state (Joyride onboarding etc.)

---

## ⚙️ Technologies

| Frontend        | Backend    | Database   | Misc             |
| --------------- | ---------- | ---------- | ---------------- |
| React           | Node.js    | PostgreSQL | Prisma ORM       |
| Redux Toolkit   | Express.js |            | JWT Auth         |
| Zustand         |            |            | ESLint, Prettier |
| Vite            |            |            | GraphQL Ready    |
| React Hook Form |            |            | Docker (planned) |

---

## ✅ Planned Features (🚧 Roadmap)

* [ ] Docker Support for Dev/Prod
* [ ] Advanced Role Permissions (e.g. Moderator)
* [ ] GraphQL Backend Support
* [ ] Exam Statistics Dashboard
* [ ] PDF & Excel Report Export
* [ ] Exam Result Auto Email
* [ ] WebSocket for Real-Time Quiz Status

---

## 🧪 Testing

Frontend:

```bash
npm run test
```

Backend:

```bash
npm run test
```

> We're using **Jest** and **React Testing Library** (to be expanded further).

---

## 🧑‍💻 Contributing

We love contributions! Please fork the repo and submit a pull request with a clear title and description.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team & Credits

Maintained by the **Chasfat Projects Dev Team**.

Special thanks to all contributors and testers involved in early builds.

