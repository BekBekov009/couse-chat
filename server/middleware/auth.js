const jwt = require("jsonwebtoken");
const { Users } = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function signToken(user) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
}

/** Protects a route: requires a valid Bearer token, attaches req.user. */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not logged in." });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = Users.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "Account no longer exists." });
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired, please log in again." });
  }
}

/**
 * Extra gate for admin-only routes. Always use AFTER requireAuth, e.g.:
 *   router.post("/courses", requireAuth, requireAdmin, handler)
 * This is the real security boundary — the frontend hiding a button is
 * not enough on its own, since anyone could call the API directly.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}

module.exports = { signToken, requireAuth, requireAdmin, JWT_SECRET };
