import jwt from "jsonwebtoken";

// Reads the JWT from the httpOnly cookie, verifies it, and attaches
// { id, role } to req.user. Rejects with 401 if missing/invalid.
export function requireAuth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session." });
  }
}

// Use after requireAuth to restrict a route to specific roles.
// e.g. router.post("/products", requireAuth, requireRole("provider"), handler)
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "You don't have access to this resource." });
    }
    next();
  };
}
