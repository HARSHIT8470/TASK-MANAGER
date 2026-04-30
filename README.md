# TaskFlow — Project & Task Management

A full-stack, production-ready web application for managing projects and tasks with Role-Based Access Control (RBAC).

![Tech Stack](https://img.shields.io/badge/React-Vite-blue) ![Node](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen) ![JWT](https://img.shields.io/badge/Auth-JWT-orange)

---

## 🧱 Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Frontend   | React 18 + Vite, Tailwind CSS v3      |
| Backend    | Node.js, Express.js                   |
| Database   | MongoDB + Mongoose                    |
| Auth       | JWT (JSON Web Tokens) + bcrypt        |
| API Docs   | Swagger UI (`/api/docs`)              |
| Docker     | Docker Compose (Mongo + Server + Client) |

---

## 📁 Project Structure

```
task manager/
├── server/                  # Express API
│   ├── config/db.js         # MongoDB connection
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth + Validation
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── utils/swagger.js     # Swagger config
│   ├── server.js            # Entry point
│   └── .env.example
├── client/                  # React Frontend
│   ├── src/
│   │   ├── api/             # Axios + services
│   │   ├── components/      # UI components
│   │   ├── context/         # Auth context
│   │   └── pages/           # Route pages
│   ├── tailwind.config.js
│   └── .env.example
└── docker-compose.yml
```

---

## 🚀 Getting Started (Local)

### Prerequisites
- Node.js v18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

### 1. Clone & Setup Backend

```bash
cd "task manager/server"
cp .env.example .env       # Edit .env with your values
npm install
npm run dev                # Starts on http://localhost:5000
```

### 2. Setup Frontend

```bash
cd "task manager/client"
cp .env.example .env
npm install
npm run dev                # Starts on http://localhost:5173
```

### 3. Open the app

Navigate to **http://localhost:5173** and create your first account.

> 💡 **Tip:** Sign up with role **Admin** first to unlock all project/task management features.

---

## 🐳 Docker (Full Stack)

```bash
# From the root "task manager/" directory
docker-compose up --build
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:5000  
- Swagger Docs: http://localhost:5000/api/docs

---

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable      | Description                     | Default                             |
|---------------|---------------------------------|-------------------------------------|
| `PORT`        | API server port                 | `5000`                              |
| `MONGO_URI`   | MongoDB connection string       | `mongodb://localhost:27017/taskmanager` |
| `JWT_SECRET`  | JWT signing secret (keep private!) | —                                |
| `JWT_EXPIRE`  | Token expiry duration           | `7d`                                |
| `CLIENT_URL`  | Frontend URL for CORS           | `http://localhost:5173`             |

### Client (`client/.env`)

| Variable        | Description        | Default                        |
|-----------------|--------------------|--------------------------------|
| `VITE_API_URL`  | Backend API URL    | `http://localhost:5000/api`    |

---

## 🔗 API Reference

### Auth
| Method | Endpoint             | Access  | Description        |
|--------|----------------------|---------|--------------------|
| POST   | `/api/auth/signup`   | Public  | Register user      |
| POST   | `/api/auth/login`    | Public  | Login user         |
| GET    | `/api/auth/me`       | Private | Get current user   |
| GET    | `/api/auth/users`    | Admin   | List all users     |

### Projects
| Method | Endpoint                            | Access        | Description          |
|--------|-------------------------------------|---------------|----------------------|
| POST   | `/api/projects`                     | Admin         | Create project       |
| GET    | `/api/projects`                     | Private       | List projects        |
| GET    | `/api/projects/:id`                 | Private       | Get project          |
| PUT    | `/api/projects/:id`                 | Admin         | Update project       |
| DELETE | `/api/projects/:id`                 | Admin         | Delete project       |
| PUT    | `/api/projects/:id/members`         | Admin         | Add member           |
| DELETE | `/api/projects/:id/members/:userId` | Admin         | Remove member        |

### Tasks
| Method | Endpoint          | Access        | Description            |
|--------|-------------------|---------------|------------------------|
| POST   | `/api/tasks`      | Admin         | Create task            |
| GET    | `/api/tasks`      | Private       | List tasks (filtered)  |
| GET    | `/api/tasks/stats`| Private       | Dashboard stats        |
| GET    | `/api/tasks/:id`  | Private       | Get task               |
| PUT    | `/api/tasks/:id`  | Private       | Update task            |
| DELETE | `/api/tasks/:id`  | Admin         | Delete task            |

> Full interactive docs at **http://localhost:5000/api/docs** (Swagger UI)

---

## 👥 Role Permissions

| Feature                      | Admin | Member |
|------------------------------|-------|--------|
| View assigned projects       | ✅    | ✅     |
| Create / Edit / Delete projects | ✅ | ❌     |
| Manage project members       | ✅    | ❌     |
| Create / Assign / Delete tasks | ✅  | ❌     |
| View assigned tasks          | ✅    | ✅     |
| Update task status           | ✅    | ✅     |

---

## 🛡️ Security Features

- Password hashing with **bcrypt** (12 salt rounds)
- **JWT** authentication on all private routes
- **Helmet** for HTTP security headers
- **express-rate-limit** (200 req / 15 min)
- **express-mongo-sanitize** to prevent NoSQL injection
- Input validation via **express-validator**
- CORS restricted to `CLIENT_URL`

---

## 🚀 Deployment

### Backend → [Render](https://render.com) / Railway
1. Push `server/` to a repo
2. Set env variables in dashboard
3. Build command: `npm install`
4. Start command: `node server.js`

### Frontend → [Vercel](https://vercel.com) / Netlify
1. Push `client/` to a repo
2. Set `VITE_API_URL` to your Render backend URL
3. Build command: `npm run build`
4. Publish directory: `dist`

---

## 📸 Features Summary

- 🔐 JWT Auth with Admin / Member RBAC
- 📊 Dashboard with stats, progress bar, recent tasks
- 📁 Projects with CRUD, member management, status tracking
- ✅ Tasks with kanban view per project, table view globally
- 🔍 Search & filter across all resources
- 📄 Pagination
- 🔔 Toast notifications
- ⏳ Loading states & empty states
- 📱 Responsive dark-mode UI
- 📚 Swagger API docs
- 🐳 Docker Compose setup
