# Coursework — real accounts + shared chat

A course platform with a genuine backend now: real registration/login
(hashed passwords, JWT sessions), and a chat that every logged-in account
can see and post to, with messages automatically deleted after 30 days.

## What changed from the localStorage version

- **Accounts are real and shared.** They live on the server (in
  `server/data/users.json`), not in one browser's storage. Anyone who
  registers can log in from any device and see the same data.
- **Chat is shared.** Every message a user posts is visible to every other
  logged-in user, stored in `server/data/messages.json`, and automatically
  pruned once it's older than 30 days (configurable).
- **Passwords are hashed** with bcrypt — never stored in plain text.
- **Sessions use JWT** — a signed token proves who you are on each request,
  and survives a page refresh.

## Folder structure

```
course-app/
├── server/                 ← Node/Express backend (run this first)
│   ├── server.js
│   ├── db.js                (JSON-file data store — no DB install needed)
│   ├── middleware/auth.js
│   ├── routes/auth.js       (register, login, /me)
│   ├── routes/messages.js   (shared chat, 30-day retention)
│   ├── data/                (auto-created: users.json, messages.json)
│   └── .env.example
└── client/                  ← React + Vite + Tailwind frontend
    └── src/
        ├── api/client.js
        ├── context/AuthContext.jsx
        └── components/
            ├── Login.jsx
            ├── Register.jsx
            ├── Lessons.jsx
            ├── Chat.jsx
            ├── Layout.jsx
            └── ProtectedRoute.jsx
```

You don't need to create any of these folders yourself — they're already
here. Just install dependencies and run.

## What to install

You need **Node.js** installed first (v18+; check with `node -v`). Then,
from two separate terminals:

### 1. Backend

```bash
cd server
npm install
copy .env.example .env        (Windows)   — or —   cp .env.example .env   (Mac/Linux)
npm run dev
```

`npm install` here pulls in: `express`, `cors`, `dotenv`, `bcryptjs`,
`jsonwebtoken`, and `nodemon` (dev only) — all listed in
`server/package.json`, so one `npm install` gets everything.

This starts the API on **http://localhost:4000**.

### 2. Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

`npm install` here pulls in: `react`, `react-dom`, `react-router-dom`, and
(dev-only) `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`,
`autoprefixer` — all listed in `client/package.json`.

This starts the site on **http://localhost:5173**. Open that in your
browser — the Vite dev server automatically forwards any `/api/...`
request to your backend on port 4000, so there's no CORS setup to fight
with in development.

## Using it

1. Go to `http://localhost:5173/register`, create an account.
2. You're logged in — visit **Chat** and send a message.
3. Open the site in a different browser (or an incognito window), register
   a second account, and send a message there too — you'll see both
   accounts' messages in the same chat, because it's now stored on the
   server, not per-browser.

## About the 30-day retention

Every time someone loads the chat, and once an hour in the background, the
server deletes any message older than 30 days (`MESSAGE_RETENTION_DAYS` in
`server/.env`). There's no way to recover a deleted message — it's a hard
delete, matching what you asked for.

## Honest limitations, and what's next

- **The JSON-file store is fine for getting started and testing with a
  handful of users**, but it rewrites the whole file on every message —
  it will get slow with a lot of traffic or a lot of history. When you're
  ready, swap `server/db.js` for a real database (Postgres, MySQL, SQLite
  via `better-sqlite3`) — the rest of the app doesn't need to change, since
  every route only talks to `db.js`'s functions.
- **Chat uses polling** (checks for new messages every 4 seconds), not a
  live socket connection. It works, but for instant delivery you'd want to
  add WebSockets (e.g. `socket.io`) later — a bigger change worth doing
  once the basics feel solid.
- **Hosting**: right now this only runs on your own computer. To let real
  people use it, you'll need to deploy the backend somewhere it stays
  running (Render, Railway, Fly.io) and the frontend somewhere static
  (Vercel, Netlify) — happy to walk through that whenever you're ready.
