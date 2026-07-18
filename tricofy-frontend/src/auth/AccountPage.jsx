import { useState } from "react";
import { useAuth } from "./useAuth";
import { GoogleButton } from "./GoogleButton";
import { Button, PageIntro } from "../components/ui";

function Field({ label, wide, children }) {
  return <label className={wide ? "wide" : ""}><span>{label}</span>{children}</label>;
}

export function AccountPage({ go }) {
  const { user, login, register, logout } = useAuth();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({ name: "", email: "", password: "", brandName: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role,
          brandName: role === "provider" ? form.brandName.trim() : undefined,
        });
      } else {
        await login({ email: form.email.trim(), password: form.password });
      }
      go("/");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (user) {
    return (
      <div className="page account-page">
        <section className="account-hero section-pad">
          <PageIntro
            eyebrow="Your Trichofy account"
            title={`Welcome back, ${user.name.split(" ")[0]}.`}
            text={user.role === "provider" ? "You're signed in as a product provider." : "You're signed in."}
          />
          <div className="account-actions">
            {user.role === "provider" && (
              <Button onClick={() => go("/providers")}>Go to provider console</Button>
            )}
            <Button variant="outline" onClick={() => go("/analysis")}>Start a hair analysis</Button>
            <Button variant="outline" onClick={async () => { await logout(); go("/"); }}>Sign out</Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page account-page">
      <section className="account-hero section-pad">
        <PageIntro
          eyebrow="Your Trichofy account"
          title={mode === "signup" ? "Create your account." : "Welcome back."}
          text={
            mode === "signup"
              ? "Sign up to save your hair profile, or register as a product provider."
              : "Sign in to pick up where you left off."
          }
        />
      </section>

      <section className="account-form-section section-pad">
        <form className="contact-form account-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="role-toggle" role="group" aria-label="Account type">
              <button type="button" className={role === "user" ? "active" : ""} onClick={() => setRole("user")}>
                I'm a user
              </button>
              <button type="button" className={role === "provider" ? "active" : ""} onClick={() => setRole("provider")}>
                I'm a product provider
              </button>
            </div>
          )}

          {mode === "signup" && (
            <Field label="Your name">
              <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" required />
            </Field>
          )}

          {mode === "signup" && role === "provider" && (
            <Field label="Brand name">
              <input value={form.brandName} onChange={(e) => update("brandName", e.target.value)} placeholder="Your brand" />
            </Field>
          )}

          <Field label="Email address">
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" required />
          </Field>

          <Field label="Password">
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
              minLength={mode === "signup" ? 8 : undefined}
              required
            />
          </Field>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </Button>

          {error && <p className="form-error">{error}</p>}

          <div className="account-divider"><span>or</span></div>

          <GoogleButton
            role={role}
            brandName={role === "provider" ? form.brandName.trim() : undefined}
            onSuccess={() => go("/")}
            onError={setError}
          />

          <p className="account-switch">
            {mode === "signup" ? "Already have an account?" : "New to Trichofy?"}{" "}
            <button type="button" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); }}>
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}
