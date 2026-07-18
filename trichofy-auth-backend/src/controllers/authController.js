import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function issueToken(user, res) {
  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
  res.cookie("token", token, COOKIE_OPTIONS);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidRole(role) {
  return role === "user" || role === "provider";
}

// POST /auth/register
export async function register(req, res) {
  try {
    const { name, email, password, role, brandName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }
    if (role && !isValidRole(role)) {
      return res.status(400).json({ error: "Role must be 'user' or 'provider'." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || "user",
      brandName: role === "provider" ? brandName || null : null,
    });

    issueToken(user, res);
    return res.status(201).json({ user: user.toSafeJSON() });
  } catch (err) {
    console.error("[auth] register error:", err);
    return res.status(500).json({ error: "Something went wrong creating your account." });
  }
}

// POST /auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Same error for "no user" and "wrong password" - don't reveal which
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    issueToken(user, res);
    return res.json({ user: user.toSafeJSON() });
  } catch (err) {
    console.error("[auth] login error:", err);
    return res.status(500).json({ error: "Something went wrong logging you in." });
  }
}

// POST /auth/google
// Body: { idToken, role? }  -- role is only used the first time a Google
// account signs in (to decide user vs provider). Ignored on later logins.
export async function googleAuth(req, res) {
  try {
    const { idToken, role, brandName } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "Missing Google ID token." });
    }
    if (role && !isValidRole(role)) {
      return res.status(400).json({ error: "Role must be 'user' or 'provider'." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(401).json({ error: "Could not verify Google account." });
    }

    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }],
    });

    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        role: role || "user",
        brandName: role === "provider" ? brandName || null : null,
      });
    } else if (!user.googleId) {
      // Existing email/password account signing in with Google for the first time
      user.googleId = payload.sub;
      await user.save();
    }

    issueToken(user, res);
    return res.json({ user: user.toSafeJSON() });
  } catch (err) {
    console.error("[auth] google auth error:", err);
    return res.status(401).json({ error: "Google sign-in failed." });
  }
}

// POST /auth/logout
export function logout(req, res) {
  res.clearCookie("token", COOKIE_OPTIONS);
  return res.json({ ok: true });
}

// GET /auth/me
export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  return res.json({ user: user.toSafeJSON() });
}
