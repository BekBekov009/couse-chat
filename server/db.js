/* ============================================================
   db.js — a tiny JSON-file data store.
   No native modules, no separate database server to install —
   everything lives in server/data/*.json. Good for getting a
   real shared backend running fast; swap for Postgres/MySQL
   later without touching routes much (same function names).
   ============================================================ */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function ensureFile(file, fallback) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
  }
}
ensureFile(USERS_FILE, []);
ensureFile(MESSAGES_FILE, []);

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

/* ---------------- users ---------------- */
const Users = {
  all() {
    return readJSON(USERS_FILE);
  },
  findByEmail(email) {
    return this.all().find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  },
  findById(id) {
    return this.all().find((u) => u.id === id);
  },
  create({ name, email, passwordHash }) {
    const users = this.all();
    const user = { id: genId(), name, email, passwordHash, createdAt: Date.now() };
    users.push(user);
    writeJSON(USERS_FILE, users);
    return user;
  },
};

/* ---------------- messages ---------------- */
const Messages = {
  all() {
    return readJSON(MESSAGES_FILE);
  },
  create({ userId, userName, content }) {
    const messages = this.all();
    const message = { id: genId(), userId, userName, content, createdAt: Date.now() };
    messages.push(message);
    writeJSON(MESSAGES_FILE, messages);
    return message;
  },
  /** Removes messages older than `days` days, returns the remaining list. */
  pruneOlderThan(days) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const all = this.all();
    const messages = all.filter((m) => m.createdAt >= cutoff);
    // Only touch the file if something was actually removed — avoids
    // needless writes (and needless nodemon restarts) on every request.
    if (messages.length !== all.length) {
      writeJSON(MESSAGES_FILE, messages);
    }
    return messages;
  },
};

module.exports = { Users, Messages };
