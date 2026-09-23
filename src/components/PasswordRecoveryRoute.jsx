import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Navigate } from "react-router";

/**
 * TODO (password reset flow) — resume here
 *
 * WHAT WE FOUND:
 * 1. The repeated "otp_expired" error is NOT a bug in this component. Supabase's
 *    reset-password link points straight to Supabase's own server, and some email
 *    providers/security scanners "pre-visit" links before we ever click them —
 *    which uses up the one-time token instantly. That's why even a brand-new,
 *    single-clicked link showed up already expired.
 *
 *    THE FIX (not yet done): stop sending a link that gets used just by being
 *    loaded. Instead:
 *      a) Change the "Reset Password" email template in the Supabase dashboard
 *         to link to our own page with the token as a plain query param
 *         (?token_hash=...&type=recovery) instead of Supabase's /verify link.
 *      b) On our page, DON'T do anything automatically on load. Only call
 *         supabase.auth.verifyOtp({ token_hash, type: "recovery" }) when the
 *         user clicks a real button (e.g. "Continue" or the submit button on
 *         the new-password form). That way a scanner loading the page can't
 *         burn the token — only a human clicking can.
 *
 * 2. The "blank page" when clicking an expired link is a separate, related
 *    issue: Supabase's client auto-scans the URL for auth info in the
 *    background (detectSessionInUrl), and it can clear/process the hash
 *    before this component gets a chance to read it. Once we switch to the
 *    query-param + button-click approach above, this whole hash-reading
 *    dance goes away and this bug should disappear on its own.
 *
 * KNOWN BUG IN THIS FILE RIGHT NOW:
 *    params.get("error.description") should be params.get("error_description")
 *    — it's an underscore in the real param name, not a dot. Right now this
 *    always returns null, so linkError falls back to the generic message
 *    every time (harmless, but worth fixing).
 *
 * NEXT SESSION: rewrite this route + UpdateForgottenPassword to use the
 * token_hash/type query-param + verifyOtp-on-click pattern instead of the
 * hash-based auto-detection this file currently does.
 */

/**
 * Password Recovery Route Component
 * Listens for a PASSWORD_RECOVERY event from supabase
 * Allows access only during a password recovery flow.
 * @param {React.ReactNode} children - child component whose route is protected
 * @returns {JSX.Element} Loading state, redirect, or protected child component
 */
const PasswordRecoveryRoute = ({ children }) => {
  // Track state for loading and password recovery
  const [loading, setLoading] = useState(true);
  const [recoverySession, setRecoverySession] = useState(false);
  const [linkError, setLinkError] = useState(null);

  useEffect(() => {
    // Check hash for error or recovery
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, ""));

    // Supabase appends error info directly to the hash
    if (params.get("error")) {
      setLinkError(
        params.get("error.description") ||
          "This reset link is invalid or has expired.",
      );
    }

    const hasRecoveryHash = params.get("type") === "recovery";
    // Listen for PASSWORD_RECOVERY auth event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoverySession(true);
        setLoading(false);
      } else if (!hasRecoveryHash) {
        setLoading(false);
      }
    });
    // Safety new in case PASSWORD_RECOVERY never fires despite the hash
    const timeout = setTimeout(() => setLoading(false), 5000);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-message-container">
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  if (linkError) {
    return <Navigate to="/forgot-password" replace state={{ linkError }} />;
  }

  if (!recoverySession) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
};

export default PasswordRecoveryRoute;
