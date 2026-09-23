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

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY auth event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoverySession(true);
        setLoading(false);
      }
    });

    // Handle an invalid/expired/already used link here
    // Redirect to sign in and set loading as false after 5 seconds
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

  if (!recoverySession) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
};

export default PasswordRecoveryRoute;
