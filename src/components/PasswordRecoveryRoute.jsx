import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Navigate } from "react-router";

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
