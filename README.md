# Doctor Hub

A role-based healthcare portal for booking appointments, verifying payments, managing clinical records, and administering practitioners. Full-stack monorepo: **React** frontend + **Express** REST API.

**Student:** Rabia Ashfaq · FA23-BSE-074-5B

---

## Live Links

| Item | Link | Status |
|------|------|--------|
| **Live frontend** | [https://doctor-hub-seven.vercel.app/](https://doctor-hub-seven.vercel.app/) | Deployed (Vercel) |
| **Project demo (video)** | [Watch on Google Drive](https://drive.google.com/file/d/1PH_RbziZxeLKzxePoX0r0-M5s0j210lt/view?usp=sharing) | Available |
| **Backend API** | — | **Pending** — see note below |

> **Backend deployment (pending):** The API uses **SQLite** (file-based database) and local file uploads. Free Node hosts (e.g. Render) currently require a payment card for new accounts, so the backend is **not deployed yet**. It runs fully on localhost. We plan to deploy after migrating to **PostgreSQL** on a free tier (Render / Railway / Neon) when hosting is available.

For full functionality (login, doctors, bookings), run the backend locally and point the frontend to `http://localhost:5000/api` (see [Run locally](#run-locally)).

---

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 19, Vite 8, React Router 7, Axios, Lucide React |
| **Backend** | Node.js, Express 4, Sequelize 6, JWT, bcryptjs, Multer |
| **Database** | SQLite (development), MySQL & PostgreSQL supported |
| **Security** | Helmet, CORS, RBAC, express-validator |

---

## Demo Logins

**Password for every account:** `password123`

| Role | Email |
|------|--------|
| Super Admin | `superadmin@doctorhub.com` |
| Admin | `admin@doctorhub.com` |
| Doctor | `doctor@doctorhub.com` (Dr. Sarah Connor — approved) |
| Doctor | `doctor2@doctorhub.com` (Dr. James Wilson — approved) |
| Doctor (pending) | `doctor.pending@doctorhub.com` (cannot log in until approved) |
| Assistant | `assistant@doctorhub.com` |
| Assistant | `assistant2@doctorhub.com` |
| Patient | `patient@doctorhub.com` |
| Patient | `patient2@doctorhub.com` |

Run `npm run seed` in `backend/` to load clinics, appointments, payments, and sample medical records.

---

## Run Locally

**Prerequisites:** Node.js 18+

### Backend

```powershell
cd backend
npm install
copy .env.example .env
npm run dev
npm run seed
```

API: **http://localhost:5000** · Health: **http://localhost:5000/api/health**

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

App: **http://localhost:5173**

Optional: `frontend/.env` → `VITE_API_URL=http://localhost:5000/api`

---

## Main Features

- **Patients:** Find doctors, book appointments, upload payment proof, view medical history
- **Assistants:** Verify or reject payments → confirm/cancel appointments
- **Doctors:** Schedule, patient records, diagnoses and prescriptions (insert-only history)
- **Admin:** Approve doctors, analytics, user management

**Appointment flow:** `pending` → `payment_uploaded` → `payment_verified` → `confirmed` → `completed` (or `cancelled` if payment rejected)

---

## Project Structure

```
doctor-hub/
├── backend/          # Express API, Sequelize models, seeder
├── frontend/         # React SPA (Vite)
└── vercel.json       # Frontend deploy config (repo root)
```

---

## Environment (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

---

## NPM Scripts

| Location | Command | Description |
|----------|---------|-------------|
| Backend | `npm run dev` | Start API (nodemon) |
| Backend | `npm run seed` | Demo users & sample data |
| Frontend | `npm run dev` | Vite dev server |
| Frontend | `npm run build` | Production build |

---

## License

ISC
