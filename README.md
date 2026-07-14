# Coursework — admin panel, student panel, chat

One login page, two experiences: signing in as the admin lands you in the
**Admin panel** (manage courses/lessons, reply to students); signing in as
a student lands you in the **student area** (browse lessons, public chat,
and a private thread with the teacher).

## What's in each panel

**Admin panel** (`/admin`, admin only)
- **Courses tab** — create/edit/delete courses, and add video, text, or
  PDF lessons to each one.
- **Student messages tab** — an inbox of every student who's messaged
  you, with a reply thread for each.

**Student area** (students only)
- `/lessons` — every course and lesson the admin has published.
- `/chat` — the public chat, visible to every logged-in student (and the
  admin, if they check it).
- `/messages` — a private 1:1 thread with the teacher. Only that student
  and the admin can see it.

One login form for everyone — after checking your password, the server
tells the frontend your role, and you're sent to the right place
automatically. There's no separate admin login page, and no way to
register as admin through the sign-up form — only the server can create
an admin account (see below).

## How the admin account works

Nobody can become admin by registering. Instead, the server creates the
admin account itself on startup, from environment variables:

```
ADMIN_NAME=Бек
ADMIN_EMAIL=collectbp@gmail.com
ADMIN_PASSWORD=your-real-password
```

Set these in `server/.env` locally, and in your host's environment
variables (Render, etc.) for production. The server only creates the
account if that email doesn't exist yet — safe to leave these set
permanently, they won't overwrite anything after the first run.

Your existing local account (email `collectbp@gmail.com`) already has
`"role": "admin"` set directly in `server/data/users.json`, so locally
you can just log in with your existing password right away — the
`ADMIN_*` variables mainly matter for a fresh deploy where that file
starts empty (see the warning below).

## ⚠️ Important: about deploying the JSON data files

`server/data/*.json` (users, messages, courses, direct messages) is
**gitignored on purpose** — it holds password hashes and private
conversations, which should never end up in a public GitHub repo.

This has a real consequence: **on most hosts, a fresh deploy starts with
empty data files.** Some hosts (like Render's free tier) also reset the
filesystem on every redeploy — meaning courses, chat history, and
registered students can be wiped out each time you push new code.

This is fine for getting the app live and testing the flow, but it's not
where you want to stay long-term. Two ways forward when you're ready:
1. **Add a persistent disk** on your host (Render offers this on paid
   instances) so `server/data/` survives redeploys.
2. **Move to a real database** (Postgres is the common choice — Render,
   Railway, and Supabase all offer a free tier). This only requires
   rewriting `server/db.js`; every route calls functions like
   `Users.findByEmail()`, so the rest of the app doesn't need to change.

For now, the `ADMIN_*` env vars above mean you'll always be able to log
in as admin even after a wipe — you'd just need to re-add courses.

## Running locally

Terminal 1:
```bash
cd server
npm install
cp .env.example .env      # fill in JWT_SECRET and ADMIN_* at minimum
npm run dev
```

Terminal 2:
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` (or whatever port Vite prints).

## Deploying

- **Backend → Render** (or Railway/Fly.io): root directory `server`,
  build command `npm install`, start command `npm start`. Set env vars:
  `JWT_SECRET`, `MESSAGE_RETENTION_DAYS`, `FRONTEND_URL` (your Netlify
  URL), `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- **Frontend → Netlify**: set `VITE_API_URL` to your Render backend URL
  plus `/api`, e.g. `https://your-app.onrender.com/api`, then redeploy.

## API overview

| Route | Who | Purpose |
|---|---|---|
| `POST /api/auth/register` | anyone | create a student account |
| `POST /api/auth/login` | anyone | log in, get a token |
| `GET /api/auth/me` | logged in | restore session after refresh |
| `GET /api/courses` | logged in | list all courses + lessons |
| `POST/PUT/DELETE /api/courses...` | admin | manage courses & lessons |
| `GET/POST /api/messages` | logged in | public chat |
| `GET /api/dm` | admin | inbox of student conversations |
| `GET/POST /api/dm/:studentId` | that student, or admin | private thread |

## Security notes

- Every write-capable route (`POST`/`PUT`/`DELETE` on courses, and admin
  DM access) is enforced **on the backend** via `requireAdmin` middleware
  — hiding a button on the frontend is never the actual security
  boundary, the API route itself rejects non-admins.
- A student can only ever read/write their own DM thread — enforced
  server-side by comparing the logged-in user's id to the thread's
  student id, not by trusting anything the frontend sends.
- Passwords are hashed with bcrypt; the admin's password is never stored
  in plain text, including in `ADMIN_PASSWORD` after the account exists
  (only used once, on first creation).
