import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-full text-sm transition ${
      isActive ? "bg-brass text-obsidian font-semibold" : "text-parchment/80 hover:text-parchment"
    }`;

  return (
    <div className="min-h-screen bg-obsidian text-parchment flex flex-col">
      <header className="border-b border-hairline">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-brass text-lg">&#9670;</span>
            <span className="font-display text-xl tracking-wide">Coursework</span>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink to="/lessons" className={linkClass}>Lessons</NavLink>
            <NavLink to="/chat" className={linkClass}>Chat</NavLink>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted hidden sm:inline">Signed in as {user?.name}</span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="text-sm px-3 py-1.5 rounded-full border border-hairline text-parchment/80 hover:border-brass hover:text-brass transition"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-hairline py-6 text-center text-xs text-muted font-mono">
        Coursework — members' lounge
      </footer>
    </div>
  );
}
