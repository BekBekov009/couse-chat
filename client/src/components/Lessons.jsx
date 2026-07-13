const lessons = [
  { id: 1, title: "Introduction to React", description: "Learn the basics of React components and JSX.", tier: "Foundations" },
  { id: 2, title: "State and Props", description: "Understand how data flows through a React app.", tier: "Foundations" },
  { id: 3, title: "React Router", description: "Add real navigation to your single-page app.", tier: "Intermediate" },
  { id: 4, title: "Tailwind CSS", description: "Style your app with a utility-first design system.", tier: "Intermediate" },
];

export default function Lessons() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <div className="mb-10">
        <p className="font-mono text-xs tracking-widest text-brass uppercase">Your library</p>
        <h1 className="font-display text-4xl mt-2">Lessons</h1>
        <p className="text-muted mt-2 max-w-xl">
          Every lesson you've unlocked, in one place. New material is added regularly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="group bg-panel border border-hairline rounded-2xl p-6 hover:border-brass/60 transition shadow-card"
          >
            <span className="font-mono text-[11px] tracking-wide text-emerald uppercase">{lesson.tier}</span>
            <h3 className="font-display text-xl mt-2 mb-2 text-parchment">{lesson.title}</h3>
            <p className="text-muted text-sm">{lesson.description}</p>
            <button className="mt-5 text-sm font-semibold text-brass group-hover:text-brass-light transition">
              Start lesson &rarr;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
