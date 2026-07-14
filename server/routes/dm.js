const express = require("express");
const { DirectMessages, Users } = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
const RETENTION_DAYS = Number(process.env.MESSAGE_RETENTION_DAYS) || 30;
const MAX_MESSAGE_LENGTH = 2000;

/** A student can only ever see/use their own thread; admin can see any. */
function canAccessThread(req, studentId) {
  if (req.user.role === "admin") return true;
  return req.user.id === studentId;
}

/** Admin inbox: every student who has an open thread, most recent first. */
router.get("/", requireAuth, requireAdmin, (req, res) => {
  DirectMessages.pruneOlderThan(RETENTION_DAYS);
  const summaries = DirectMessages.conversationSummaries();
  const withNames = summaries.map((s) => {
    const student = Users.findById(s.studentId);
    return { ...s, studentName: student ? student.name : "Unknown student" };
  });
  res.json({ conversations: withNames });
});

router.get("/:studentId", requireAuth, (req, res) => {
  if (!canAccessThread(req, req.params.studentId)) {
    return res.status(403).json({ error: "You can't view this conversation." });
  }
  const messages = DirectMessages.pruneOlderThan(RETENTION_DAYS).filter(
    (m) => m.studentId === req.params.studentId
  );
  res.json({ messages });
});

router.post("/:studentId", requireAuth, (req, res) => {
  if (!canAccessThread(req, req.params.studentId)) {
    return res.status(403).json({ error: "You can't message in this conversation." });
  }
  const { content } = req.body || {};
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Message can't be empty." });
  }
  if (content.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).` });
  }

  const message = DirectMessages.create({
    studentId: req.params.studentId,
    senderId: req.user.id,
    senderName: req.user.name,
    senderRole: req.user.role,
    content: content.trim(),
  });
  res.status(201).json({ message });
});

module.exports = router;
