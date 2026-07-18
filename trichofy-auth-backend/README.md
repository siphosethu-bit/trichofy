# Trichofy Auth Backend

A standalone Express + MongoDB service handling sign up, login, and Google sign-in
for two roles: `user` and `provider`. Sessions are a JWT stored in an httpOnly
cookie, so the frontend never touches the token directly.

## 1. Setup

```bash
cd trichofy-auth-backend
npm install
cp .env.example .env
```

Fill in `.env`:
- `MONGO_URI` — a free MongoDB Atlas cluster works fine (atlas.mongodb.com)
- `JWT_SECRET` — any long random string, e.g. `openssl rand -hex 32`
- `GOOGLE_CLIENT_ID` — from Google Cloud Console → APIs & Services → Credentials
  → Create Credentials → OAuth Client ID → Web application. Add your frontend
  URL (e.g. `http://localhost:5173`) under "Authorized JavaScript origins."
- `FRONTEND_URL` — where your React app runs

```bash
npm run dev
```

Server starts on `http://localhost:4000`.

## 2. Endpoints

| Method | Path            | Body                                              | Notes |
|--------|-----------------|----------------------------------------------------|-------|
| POST   | `/auth/register`| `{ name, email, password, role, brandName? }`     | `role` is `"user"` or `"provider"` |
| POST   | `/auth/login`   | `{ email, password }`                             | |
| POST   | `/auth/google`  | `{ idToken, role?, brandName? }`                  | `role` only used on first sign-in |
| POST   | `/auth/logout`  | —                                                  | |
| GET    | `/auth/me`      | — (requires cookie)                               | Returns current user |

All responses set/clear the `token` cookie automatically — the frontend just
needs to send requests with `credentials: "include"`.

## 3. Frontend integration (React)

In `tricofy-frontend`, add an API base and always send credentials:

```js
const AUTH_URL = import.meta.env.VITE_AUTH_URL || "http://localhost:4000/auth";

export async function registerUser({ name, email, password, role }) {
  const res = await fetch(`${AUTH_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function fetchMe() {
  const res = await fetch(`${AUTH_URL}/me`, { credentials: "include" });
  if (!res.ok) return null;
  return (await res.json()).user;
}
```

### Google Sign-In button

Load the Google script in `index.html`:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

Then render the button and send the returned credential to your backend:

```jsx
useEffect(() => {
  window.google?.accounts.id.initialize({
    client_id: "YOUR_GOOGLE_CLIENT_ID",
    callback: async (response) => {
      const res = await fetch(`${AUTH_URL}/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken: response.credential, role: "user" }),
      });
      const data = await res.json();
      // set your app's logged-in user state here
    },
  });
  window.google?.accounts.id.renderButton(
    document.getElementById("google-signin-btn"),
    { theme: "outline", size: "large" }
  );
}, []);
```

```jsx
<div id="google-signin-btn"></div>
```

## 4. Deploying alongside the existing backend

Your frontend currently calls `trichofy-backend.onrender.com` for `/predict`
and `/weather`. You have two reasonable options:

1. **Deploy this as a second service** (e.g. `trichofy-auth.onrender.com`) and
   point the frontend's `VITE_AUTH_URL` at it. Simplest, no merge needed.
2. **Merge these routes into your existing backend** if you'd rather have one
   service — copy the `src/` folder's `routes`, `controllers`, `models`, and
   `middleware` in, and mount `authRoutes` on your existing Express app.

## 5. Things worth adding later

- Email verification on signup
- Password reset flow (send a signed, short-lived reset token via email)
- Rate limiting on `/auth/login` to slow down brute-force attempts
- Refresh tokens if you want shorter-lived access tokens
