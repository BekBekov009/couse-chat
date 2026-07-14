import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AdminPanel() {
  const [tab, setTab] = useState("courses");

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="font-mono text-xs tracking-widest text-brass uppercase">Admin</p>
        <h1 className="font-display text-4xl mt-2">Admin panel</h1>
      </div>

      <div className="flex gap-2 mb-8 border-b border-hairline">
        <TabButton active={tab === "courses"} onClick={() => setTab("courses")}>Courses</TabButton>
        <TabButton active={tab === "messages"} onClick={() => setTab("messages")}>Student messages</TabButton>
      </div>

      {tab === "courses" ? <CoursesTab /> : <MessagesTab />}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-semibold -mb-px border-b-2 transition ${
        active ? "border-brass text-brass" : "border-transparent text-muted hover:text-parchment"
      }`}
    >
      {children}
    </button>
  );
}

/* ============================================================
   COURSES TAB
   ============================================================ */
function CoursesTab() {
  const [courses, setCourses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const data = await apiFetch("/courses");
      setCourses(data.courses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function createCourse() {
    try {
      const data = await apiFetch("/courses", {
        method: "POST",
        body: { title: "Untitled course", description: "", category: "General" },
      });
      setSelectedId(data.course.id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  const selected = courses.find((c) => c.id === selectedId) || null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
      <div>
        <button
          onClick={createCourse}
          className="w-full bg-brass text-obsidian font-semibold py-2.5 rounded-lg hover:bg-brass-light transition mb-4"
        >
          + New course
        </button>
        {loading && <p className="text-muted text-sm font-mono">Loading…</p>}
        {error && <p className="text-red-300 text-sm">{error}</p>}
        <div className="flex flex-col gap-2">
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`text-left px-4 py-3 rounded-xl border transition ${
                c.id === selectedId
                  ? "border-brass bg-panel2"
                  : "border-hairline bg-panel hover:border-brass/50"
              }`}
            >
              <div className="font-semibold text-sm text-parchment">{c.title}</div>
              <div className="font-mono text-[11px] text-muted mt-0.5">
                {c.lessons.length} lesson{c.lessons.length === 1 ? "" : "s"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        {selected ? (
          <CourseEditor key={selected.id} course={selected} onChange={refresh} onDeleted={() => setSelectedId(null)} />
        ) : (
          <div className="border border-dashed border-hairline rounded-2xl p-10 text-center text-muted">
            Select a course on the left, or create a new one.
          </div>
        )}
      </div>
    </div>
  );
}

function CourseEditor({ course, onChange, onDeleted }) {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [category, setCategory] = useState(course.category);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/courses/${course.id}`, { method: "PUT", body: { title, description, category } });
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete "${course.title}"? This also removes its lessons.`)) return;
    try {
      await apiFetch(`/courses/${course.id}`, { method: "DELETE" });
      onDeleted();
      onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="bg-panel border border-hairline rounded-2xl p-6">
      {error && <p className="text-red-300 text-sm mb-3">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
        </Field>
        <Field label="Category">
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="input" />
        </Field>
      </div>
      <Field label="Description">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-[80px]" />
      </Field>

      <div className="flex gap-3 mb-8">
        <button
          onClick={save}
          disabled={saving}
          className="bg-brass text-obsidian font-semibold text-sm px-4 py-2 rounded-lg hover:bg-brass-light transition disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save course"}
        </button>
        <button
          onClick={remove}
          className="text-sm px-4 py-2 rounded-lg border border-red-800 text-red-300 hover:bg-red-900/20 transition"
        >
          Delete course
        </button>
      </div>

      <h3 className="font-display text-lg mb-3">Lessons</h3>
      <LessonManager courseId={course.id} lessons={course.lessons} onChange={onChange} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-wide text-muted mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function LessonManager({ courseId, lessons, onChange }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {lessons.map((lesson) => (
        <LessonRow key={lesson.id} courseId={courseId} lesson={lesson} onChange={onChange} />
      ))}

      {adding ? (
        <LessonForm
          courseId={courseId}
          onDone={() => {
            setAdding(false);
            onChange();
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-sm px-4 py-2 rounded-lg border border-hairline text-parchment/80 hover:border-brass hover:text-brass transition self-start"
        >
          + Add lesson
        </button>
      )}
    </div>
  );
}

function LessonRow({ courseId, lesson, onChange }) {
  const [editing, setEditing] = useState(false);

  async function remove() {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    await apiFetch(`/courses/${courseId}/lessons/${lesson.id}`, { method: "DELETE" });
    onChange();
  }

  if (editing) {
    return (
      <LessonForm
        courseId={courseId}
        lesson={lesson}
        onDone={() => {
          setEditing(false);
          onChange();
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 border border-hairline rounded-lg px-4 py-3">
      <div>
        <span className="text-sm font-semibold text-parchment">{lesson.title}</span>
        <span className="ml-2 font-mono text-[11px] text-muted uppercase">{lesson.type}</span>
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={() => setEditing(true)} className="text-xs text-brass hover:underline">Edit</button>
        <button onClick={remove} className="text-xs text-red-300 hover:underline">Delete</button>
      </div>
    </div>
  );
}

function LessonForm({ courseId, lesson, onDone, onCancel }) {
  const [title, setTitle] = useState(lesson?.title || "");
  const [type, setType] = useState(lesson?.type || "video");
  const [content, setContent] = useState(lesson?.content || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const contentLabel =
    type === "video" ? "Video embed URL (e.g. YouTube embed link)" : type === "pdf" ? "PDF URL" : "Text content";

  async function save() {
    setSaving(true);
    setError("");
    try {
      if (lesson) {
        await apiFetch(`/courses/${courseId}/lessons/${lesson.id}`, {
          method: "PUT",
          body: { title, type, content },
        });
      } else {
        await apiFetch(`/courses/${courseId}/lessons`, { method: "POST", body: { title, type, content } });
      }
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-hairline rounded-lg p-4 bg-obsidian/40">
      {error && <p className="text-red-300 text-sm mb-2">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <Field label="Lesson title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
        </Field>
        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value)} className="input">
            <option value="video">Video</option>
            <option value="text">Text</option>
            <option value="pdf">PDF</option>
          </select>
        </Field>
      </div>
      <Field label={contentLabel}>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input min-h-[70px]" />
      </Field>
      <div className="flex gap-2 mt-3">
        <button
          onClick={save}
          disabled={saving}
          className="bg-brass text-obsidian font-semibold text-sm px-4 py-2 rounded-lg hover:bg-brass-light transition disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save lesson"}
        </button>
        <button onClick={onCancel} className="text-sm px-4 py-2 rounded-lg border border-hairline text-muted hover:text-parchment transition">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   STUDENT MESSAGES TAB (admin inbox)
   ============================================================ */
const POLL_INTERVAL_MS = 4000;

function MessagesTab() {
  const [conversations, setConversations] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null); // { id, name }

  async function refreshInbox() {
    try {
      const data = await apiFetch("/dm");
      setConversations(data.conversations);
    } catch {
      // silent — thread view below shows any real errors
    }
  }

  useEffect(() => {
    refreshInbox();
    const interval = setInterval(refreshInbox, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 h-[calc(100vh-320px)] min-h-[420px]">
      <div className="overflow-y-auto flex flex-col gap-2">
        {conversations.length === 0 && (
          <p className="text-muted text-sm">No students have messaged yet.</p>
        )}
        {conversations.map((c) => (
          <button
            key={c.studentId}
            onClick={() => setSelectedStudent({ id: c.studentId, name: c.studentName })}
            className={`text-left px-4 py-3 rounded-xl border transition ${
              selectedStudent?.id === c.studentId
                ? "border-brass bg-panel2"
                : "border-hairline bg-panel hover:border-brass/50"
            }`}
          >
            <div className="font-semibold text-sm text-parchment">{c.studentName}</div>
            <div className="text-xs text-muted truncate mt-0.5">{c.content}</div>
          </button>
        ))}
      </div>

      <div className="min-h-0">
        {selectedStudent ? (
          <AdminThread student={selectedStudent} onSent={refreshInbox} />
        ) : (
          <div className="h-full border border-dashed border-hairline rounded-2xl flex items-center justify-center text-muted text-sm">
            Select a student to view the conversation.
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(ts) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(ts));
}

function AdminThread({ student, onSent }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  async function fetchThread() {
    try {
      const data = await apiFetch(`/dm/${student.id}`);
      setMessages(data.messages);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    fetchThread();
    const interval = setInterval(fetchThread, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    setSending(true);
    setError("");
    try {
      const data = await apiFetch(`/dm/${student.id}`, { method: "POST", body: { content } });
      setMessages((prev) => [...prev, data.message]);
      setInput("");
      onSent();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="h-full bg-panel border border-hairline rounded-2xl shadow-card flex flex-col overflow-hidden">
      <div className="border-b border-hairline px-5 py-3 font-semibold text-sm text-parchment">
        {student.name}
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m) => {
          const isMine = m.senderId === user.id;
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isMine
                      ? "bg-brass text-obsidian rounded-br-sm"
                      : "bg-panel2 text-parchment rounded-bl-sm border border-hairline"
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[11px] font-mono text-muted mt-1 px-1">{formatTime(m.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="border-t border-hairline p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Reply to ${student.name}…`}
          className="flex-1 bg-obsidian border border-hairline rounded-full px-4 py-2.5 text-sm text-parchment focus:outline-none focus:ring-2 focus:ring-brass/60"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-brass text-obsidian font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-brass-light transition disabled:opacity-60"
        >
          Send
        </button>
      </form>
      {error && <p className="text-red-300 text-xs px-5 pb-3">{error}</p>}
    </div>
  );
}
