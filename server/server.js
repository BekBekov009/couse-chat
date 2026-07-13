require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { Messages } = require("./db");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");

const app = express();
const PORT = process.env.PORT || 4000;
const RETENTION_DAYS = Number(process.env.MESSAGE_RETENTION_DAYS) || 30;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Prune messages older than the retention window on startup...
  Messages.pruneOlderThan(RETENTION_DAYS);
  // ...and once an hour after that, so old messages don't pile up.
  setInterval(() => Messages.pruneOlderThan(RETENTION_DAYS), 60 * 60 * 1000);
});
