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
const COURSES_FILE = path.join(DATA_DIR, "courses.json");
const DM_FILE = path.join(DATA_DIR, "direct_messages.json");

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
ensureFile(COURSES_FILE, []);
ensureFile(DM_FILE, []);

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
    // Older accounts created before roles existed default to "student".
    return readJSON(USERS_FILE).map((u) => ({ role: "student", ...u }));
  },
  findByEmail(email) {
    return this.all().find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  },
  findById(id) {
    return this.all().find((u) => u.id === id);
  },
  listStudents() {
    return this.all().filter((u) => u.role === "student");
  },
  /** New accounts are always students — nobody can register as admin. */
  create({ name, email, passwordHash }) {
    const users = readJSON(USERS_FILE);
    const user = { id: genId(), name, email, passwordHash, role: "student", createdAt: Date.now() };
    users.push(user);
    writeJSON(USERS_FILE, users);
    return user;
  },
  /** Only used by the server's own startup seed step — never exposed via an API route. */
  createAdmin({ name, email, passwordHash }) {
    const users = readJSON(USERS_FILE);
    const user = { id: genId(), name, email, passwordHash, role: "admin", createdAt: Date.now() };
    users.push(user);
    writeJSON(USERS_FILE, users);
    return user;
  },
};

/* ---------------- public chat (everyone sees everything) ---------------- */
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
  pruneOlderThan(days) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const all = this.all();
    const messages = all.filter((m) => m.createdAt >= cutoff);
    if (messages.length !== all.length) writeJSON(MESSAGES_FILE, messages);
    return messages;
  },
};

/* ---------------- direct messages (one student <-> the admin) ---------------- */
const DirectMessages = {
  all() {
    return readJSON(DM_FILE);
  },
  forStudent(studentId) {
    return this.all()
      .filter((m) => m.studentId === studentId)
      .sort((a, b) => a.createdAt - b.createdAt);
  },
  create({ studentId, senderId, senderName, senderRole, content }) {
    const messages = this.all();
    const message = { id: genId(), studentId, senderId, senderName, senderRole, content, createdAt: Date.now() };
    messages.push(message);
    writeJSON(DM_FILE, messages);
    return message;
  },
  /** For the admin's inbox: one row per student, with their latest message. */
  conversationSummaries() {
    const all = this.all();
    const byStudent = new Map();
    for (const m of all) {
      const existing = byStudent.get(m.studentId);
      if (!existing || m.createdAt > existing.createdAt) byStudent.set(m.studentId, m);
    }
    return [...byStudent.values()].sort((a, b) => b.createdAt - a.createdAt);
  },
  pruneOlderThan(days) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const all = this.all();
    const messages = all.filter((m) => m.createdAt >= cutoff);
    if (messages.length !== all.length) writeJSON(DM_FILE, messages);
    return messages;
  },
};

/* ---------------- courses & lessons ---------------- */
const Courses = {
  all() {
    return readJSON(COURSES_FILE);
  },
  get(id) {
    return this.all().find((c) => c.id === id) || null;
  },
  create({ title, description, category }) {
    const courses = this.all();
    const course = {
      id: genId(),
      title: title || "Untitled course",
      description: description || "",
      category: category || "General",
      lessons: [],
      createdAt: Date.now(),
    };
    courses.push(course);
    writeJSON(COURSES_FILE, courses);
    return course;
  },
  update(id, patch) {
    const courses = this.all();
    const i = courses.findIndex((c) => c.id === id);
    if (i === -1) return null;
    courses[i] = { ...courses[i], ...patch };
    writeJSON(COURSES_FILE, courses);
    return courses[i];
  },
  remove(id) {
    writeJSON(COURSES_FILE, this.all().filter((c) => c.id !== id));
  },
  addLesson(courseId, lesson) {
    const courses = this.all();
    const course = courses.find((c) => c.id === courseId);
    if (!course) return null;
    const newLesson = {
      id: genId(),
      title: lesson.title || "Untitled lesson",
      type: lesson.type || "text", // 'video' | 'text' | 'pdf'
      content: lesson.content || "",
    };
    course.lessons.push(newLesson);
    writeJSON(COURSES_FILE, courses);
    return newLesson;
  },
  updateLesson(courseId, lessonId, patch) {
    const courses = this.all();
    const course = courses.find((c) => c.id === courseId);
    if (!course) return null;
    const i = course.lessons.findIndex((l) => l.id === lessonId);
    if (i === -1) return null;
    course.lessons[i] = { ...course.lessons[i], ...patch };
    writeJSON(COURSES_FILE, courses);
    return course.lessons[i];
  },
  removeLesson(courseId, lessonId) {
    const courses = this.all();
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;
    course.lessons = course.lessons.filter((l) => l.id !== lessonId);
    writeJSON(COURSES_FILE, courses);
  },
};

module.exports = { Users, Messages, DirectMessages, Courses };
