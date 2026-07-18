import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function loadGoogleScript() {
  if (document.getElementById("google-identity-script")) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function GoogleButton({ role = "user", brandName, onSuccess, onError }) {
  const buttonRef = useRef(null);
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript().then(() => {
      if (cancelled || !window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const user = await loginWithGoogle({ idToken: response.credential, role, brandName });
            onSuccess?.(user);
          } catch (err) {
            onError?.(err.message || "Google sign-in failed.");
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    });

    return () => { cancelled = true; };
  }, [role, brandName, loginWithGoogle, onSuccess, onError]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="google-btn-missing">
        Google sign-in isn't configured yet (set <code>VITE_GOOGLE_CLIENT_ID</code>).
      </p>
    );
  }

  return <div className="google-btn-wrap" ref={buttonRef} />;
}
