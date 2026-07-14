import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export default function Lessons() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCourseId, setOpenCourseId] = useState(null);
  const [openLessonId, setOpenLessonId] = useState(null);

  useEffect(() => {
    apiFetch("/courses")
      .then((data) => setCourses(data.courses))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function toggleCourse(id) {
    setOpenCourseId((prev) => (prev === id ? null : id));
    setOpenLessonId(null);
  }
  function toggleLesson(id) {
    setOpenLessonId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="mb-10">
        <p className="font-mono text-xs tracking-widest text-brass uppercase">Your library</p>
        <h1 className="font-display text-4xl mt-2">Lessons</h1>
        <p className="text-muted mt-2 max-w-xl">
          Everything the instructor has published, in one place.
        </p>
      </div>

      {loading && <p className="text-muted font-mono text-sm">Loading courses…</p>}
      {error && <p className="text-red-300 text-sm">{error}</p>}

      {!loading && courses.length === 0 && (
        <div className="border border-dashed border-hairline rounded-2xl p-10 text-center text-muted">
          <h3 className="font-display text-xl text-parchment mb-2">No courses yet</h3>
          <p className="text-sm">The instructor hasn't published anything yet. Check back soon.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {courses.map((course) => {
          const isOpen = openCourseId === course.id;
          return (
            <div key={course.id} className="bg-panel border border-hairline rounded-2xl shadow-card overflow-hidden">
              <button
                onClick={() => toggleCourse(course.id)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-panel2/40 transition"
              >
                <div>
                  <span className="font-mono text-[11px] tracking-wide text-emerald uppercase">{course.category}</span>
                  <h3 className="font-display text-xl mt-1 text-parchment">{course.title}</h3>
                  {course.description && <p className="text-muted text-sm mt-1">{course.description}</p>}
                </div>
                <span className="text-brass text-sm font-mono shrink-0">
                  {course.lessons.length} lesson{course.lessons.length === 1 ? "" : "s"} {isOpen ? "▲" : "▼"}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-hairline px-6 py-4">
                  {course.lessons.length === 0 && (
                    <p className="text-muted text-sm">No lessons added to this course yet.</p>
                  )}
                  <ul className="flex flex-col gap-2">
                    {course.lessons.map((lesson, i) => {
                      const lessonOpen = openLessonId === lesson.id;
                      return (
                        <li key={lesson.id} className="border border-hairline rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleLesson(lesson.id)}
                            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-panel2/40 transition"
                          >
                            <span className="font-mono text-xs text-muted w-9">
                              L{String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="flex-1 font-semibold text-sm text-parchment">{lesson.title}</span>
                            <span className="font-mono text-[11px] text-muted uppercase">{lesson.type}</span>
                          </button>
                          {lessonOpen && (
                            <div className="px-4 pb-4 pt-1">
                              <LessonContent lesson={lesson} />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LessonContent({ lesson }) {
  if (lesson.type === "video") {
    return (
      <iframe
        className="w-full aspect-video rounded-lg border border-hairline"
        src={lesson.content}
        title={lesson.title}
        allowFullScreen
      />
    );
  }
  if (lesson.type === "pdf") {
    return (
      <a
        href={lesson.content}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-brass text-obsidian font-semibold text-sm px-4 py-2 rounded-lg hover:bg-brass-light transition"
      >
        Open PDF
      </a>
    );
  }
  return <p className="text-sm text-muted whitespace-pre-wrap">{lesson.content}</p>;
}
