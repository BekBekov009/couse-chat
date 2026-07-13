const express = require("express");
const { Messages } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const RETENTION_DAYS = Number(process.env.MESSAGE_RETENTION_DAYS) || 30;
const MAX_MESSAGE_LENGTH = 2000;

/** Everyone who is logged in can read every message from the last 30 days. */
router.get("/", requireAuth, (req, res) => {
  const messages = Messages.pruneOlderThan(RETENTION_DAYS);
  const sorted = [...messages].sort((a, b) => a.createdAt - b.createdAt);
  res.json({ messages: sorted });
});

/** Everyone who is logged in can post — the message is visible to all users. */
router.post("/", requireAuth, (req, res) => {
  const { content } = req.body || {};
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Message can't be empty." });
  }
  if (content.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).` });
  }

  const message = Messages.create({
    userId: req.user.id,
    userName: req.user.name,
    content: content.trim(),
  });
  res.status(201).json({ message });
});

module.exports = router;
