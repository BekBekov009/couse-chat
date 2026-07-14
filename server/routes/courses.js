const express = require("express");
const { Courses } = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

/* ---------- reading: any logged-in user ---------- */
router.get("/", requireAuth, (req, res) => {
  res.json({ courses: Courses.all() });
});

router.get("/:id", requireAuth, (req, res) => {
  const course = Courses.get(req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found." });
  res.json({ course });
});

/* ---------- writing: admin only ---------- */
router.post("/", requireAuth, requireAdmin, (req, res) => {
  const { title, description, category } = req.body || {};
  const course = Courses.create({ title, description, category });
  res.status(201).json({ course });
});

router.put("/:id", requireAuth, requireAdmin, (req, res) => {
  const { title, description, category } = req.body || {};
  const course = Courses.update(req.params.id, { title, description, category });
  if (!course) return res.status(404).json({ error: "Course not found." });
  res.json({ course });
});

router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  Courses.remove(req.params.id);
  res.status(204).end();
});

router.post("/:id/lessons", requireAuth, requireAdmin, (req, res) => {
  const { title, type, content } = req.body || {};
  if (!["video", "text", "pdf"].includes(type)) {
    return res.status(400).json({ error: "Lesson type must be video, text, or pdf." });
  }
  const lesson = Courses.addLesson(req.params.id, { title, type, content });
  if (!lesson) return res.status(404).json({ error: "Course not found." });
  res.status(201).json({ lesson });
});

router.put("/:id/lessons/:lessonId", requireAuth, requireAdmin, (req, res) => {
  const { title, type, content } = req.body || {};
  const lesson = Courses.updateLesson(req.params.id, req.params.lessonId, { title, type, content });
  if (!lesson) return res.status(404).json({ error: "Lesson not found." });
  res.json({ lesson });
});

router.delete("/:id/lessons/:lessonId", requireAuth, requireAdmin, (req, res) => {
  Courses.removeLesson(req.params.id, req.params.lessonId);
  res.status(204).end();
});

module.exports = router;
