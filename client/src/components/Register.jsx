import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await register(name.trim(), email.trim(), password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate("/lessons", { replace: true });
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-brass text-2xl">&#9670;</span>
          <h1 className="font-display text-3xl mt-2 text-parchment">Join Coursework</h1>
          <p className="text-muted text-sm mt-2">Create an account to start learning.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-panel border border-hairline rounded-2xl shadow-card p-8">
          {error && (
            <div className="mb-4 text-sm text-red-300 bg-red-900/20 border border-red-900/40 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm text-muted mb-1.5" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-obsidian border border-hairline rounded-lg px-4 py-2.5 text-parchment focus:outline-none focus:ring-2 focus:ring-brass/60"
              placeholder="Jane Doe"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-muted mb-1.5" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-obsidian border border-hairline rounded-lg px-4 py-2.5 text-parchment focus:outline-none focus:ring-2 focus:ring-brass/60"
              placeholder="you@example.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-muted mb-1.5" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-obsidian border border-hairline rounded-lg px-4 py-2.5 text-parchment focus:outline-none focus:ring-2 focus:ring-brass/60"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brass text-obsidian font-semibold py-2.5 rounded-lg hover:bg-brass-light transition disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-brass hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
