# Doctor Hub

A role-based healthcare portal for booking appointments, verifying payments, managing clinical records, and administering practitioners. Built as a full-stack monorepo with separate `backend` (REST API) and `frontend` (React SPA).

---

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 19, Vite 8, React Router 7, Axios, Lucide React |
| **Backend** | Node.js, Express 4, Sequelize 6, JWT, bcryptjs, Multer |
| **Database** | SQLite (default local), MySQL & PostgreSQL supported |
| **Security** | Helmet, CORS, RBAC middleware, express-validator |

---

## Quick Start (Windows)

**Prerequisites:** Node.js 18+ and npm.

### 1. Backend

```powershell
cd backend
npm install
copy .env.example .env
npm run dev
```

On first start, tables are created automatically (`sequelize.sync`). Then seed demo data:

```powershell
npm run seed
```

API: **http://localhost:5000** · Health: **http://localhost:5000/api/health**

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

App: **http://localhost:5173**

Optional: set `VITE_API_URL=http://localhost:5000/api` in `frontend/.env` (defaults to this if omitted).

---

## Demo Logins

**Password for every account:** `password123`

| Role | Email | Purpose |
|------|--------|---------|
| Super Admin | `superadmin@doctorhub.com` | Full admin access |
| Admin | `admin@doctorhub.com` | Approvals, analytics, users |
| Doctor | `doctor@doctorhub.com` | Dr. Sarah Connor — Cardiologist (approved) |
| Doctor | `doctor2@doctorhub.com` | Dr. James Wilson — Neurologist (approved) |
| Doctor (pending) | `doctor.pending@doctorhub.com` | Awaiting admin approval — cannot log in |
| Assistant | `assistant@doctorhub.com` | Payment verification (Dr. Sarah) |
| Assistant | `assistant2@doctorhub.com` | Payment verification (Dr. James) |
| Patient | `patient@doctorhub.com` | Alice — appointments, history, payments |
| Patient | `patient2@doctorhub.com` | Bob — appointments and history |

**Seeded data includes:** clinics, appointments (all statuses), payments, medical history, and prescriptions.

---

## Workflows by Role

### Patient
1. **Find Doctors** → browse approved practitioners.
2. **Book appointment** → status `pending`.
3. **Payment Upload** → submit receipt → status `payment_uploaded`.
4. **Medical History** → view diagnoses and prescriptions after visit.

### Assistant
1. Open **Verification Queue** (`/assistant/payments`).
2. **Approve** payment → appointment becomes `confirmed`.
3. **Reject** payment → appointment `cancelled`.

### Doctor
1. **My Schedule** → view confirmed/upcoming visits.
2. **Patient Records** → open patient history.
3. **Add Diagnosis** → create medical history + prescriptions on completed appointments.

### Admin / Super Admin
1. **Doctor Approvals** (`/admin/approvals`) → Approve or Revoke practitioner accounts.
2. **Analytics** → patients, doctors, appointments, revenue.
3. **User Management** → list all users by role.

### Appointment status flow

```
pending → payment_uploaded → payment_verified → confirmed → completed
                ↓
           cancelled (payment rejected)
```

Medical history and prescriptions are **insert-only** (no edit/delete via API).

---

## Project Structure

```
doctor-hub/
├── backend/
│   ├── src/
│   │   ├── config/       # DB & env
│   │   ├── controllers/
│   │   ├── middleware/   # Auth, RBAC, uploads, validation
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/        # seeder.js, constants
│   ├── uploads/          # Payment screenshots
│   ├── database.sqlite   # Created on first run (SQLite)
│   └── .env
└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── hooks/
        └── pages/
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

For MySQL/PostgreSQL, set `DB_DIALECT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`.

---

## NPM Scripts

| Location | Command | Description |
|----------|---------|-------------|
| Backend | `npm run dev` | Start API with nodemon |
| Backend | `npm start` | Start API (production) |
| Backend | `npm run seed` | Load demo users & sample data |
| Frontend | `npm run dev` | Start Vite dev server |
| Frontend | `npm run build` | Production build → `dist/` |

---

## Fresh Database Reset

```powershell
cd backend
# Stop the server first, then:
Remove-Item database.sqlite -ErrorAction SilentlyContinue
npm run dev
# In another terminal:
npm run seed
```

---

## Deployment

### Can both run on Vercel?

| Part | Vercel | Why |
|------|--------|-----|
| **Frontend** | Yes | Static Vite build — ideal for Vercel |
| **Backend** | No (not recommended) | Express server, SQLite file DB, and local file uploads need a persistent Node host |

**Recommended:** Frontend on **Vercel**, backend on **Render** (free tier).

---

### 1. Deploy backend (Render)

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → **New** → **Blueprint** (or Web Service).
3. Connect the repo; Render reads `backend/render.yaml`.
4. After deploy, open the **Shell** tab and run:
   ```bash
   npm run seed
   ```
5. Copy your API URL, e.g. `https://doctor-hub-api.onrender.com`.

**Environment variables** (Render dashboard):

| Variable | Example |
|----------|---------|
| `FRONTEND_URL` | `https://your-app.vercel.app` (set after frontend deploy) |
| `JWT_SECRET` | long random string |
| `DB_DIALECT` | `sqlite` |
| `DB_STORAGE` | `./database.sqlite` |

Health check: `https://<your-api>/api/health`

---

### 2. Deploy frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Framework: **Vite** (auto-detected).
4. **Environment variable:**

   | Name | Value |
   |------|--------|
   | `VITE_API_URL` | `https://doctor-hub-api.onrender.com/api` |

5. Deploy. Copy the Vercel URL (e.g. `https://doctor-hub.vercel.app`).
6. In Render, set `FRONTEND_URL` to that Vercel URL and redeploy the backend.

`frontend/vercel.json` handles React Router (SPA) routing.

**CLI (optional):**

```powershell
cd frontend
npx vercel
# follow login prompts; set VITE_API_URL in Vercel project settings
```

---

### 3. Post-deploy checklist

- [ ] Backend `/api/health` returns `UP`
- [ ] `npm run seed` ran on Render (demo logins work)
- [ ] `VITE_API_URL` points to live API with `/api` suffix
- [ ] `FRONTEND_URL` on backend matches Vercel domain
- [ ] Login works from production frontend

**Note:** Free Render services sleep after inactivity; first request may take ~30s. SQLite on free tier may reset on redeploy — re-run `npm run seed` if data is missing.

---

## License

ISC
