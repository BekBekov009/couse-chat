require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const { Messages, DirectMessages, Users } = require("./db");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const courseRoutes = require("./routes/courses");
const dmRoutes = require("./routes/dm");

const app = express();
const PORT = process.env.PORT || 4000;
const RETENTION_DAYS = Number(process.env.MESSAGE_RETENTION_DAYS) || 30;

// In production, only allow requests from your actual deployed frontend.
// Locally, FRONTEND_URL is usually unset, so we fall back to allowing
// everything (fine for local dev).
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : {}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/dm", dmRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

function pruneAll() {
  Messages.pruneOlderThan(RETENTION_DAYS);
  DirectMessages.pruneOlderThan(RETENTION_DAYS);
}

/**
 * Makes sure an admin account exists. This matters most on a fresh
 * deploy (Render, etc.) where server/data/*.json starts empty — without
 * this, there would be no way to log in as admin at all. Set ADMIN_NAME,
 * ADMIN_EMAIL, and ADMIN_PASSWORD as environment variables on your host;
 * this only ever runs once (it skips if that email already exists).
 */
async function seedAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;
  if (Users.findByEmail(ADMIN_EMAIL)) return;

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  Users.createAdmin({ name: ADMIN_NAME || "Admin", email: ADMIN_EMAIL, passwordHash });
  console.log(`Seeded admin account for ${ADMIN_EMAIL}`);
}

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await seedAdmin();
  pruneAll();
  setInterval(pruneAll, 60 * 60 * 1000);
});
