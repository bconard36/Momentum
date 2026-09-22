import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Navigate } from "react-router";

/**
 * Password Recovery Route Component
 * Listens for a PASSWORD_RECOVERY event from supabase
 * Displays a loading state while event is being checked, redirects unauthorized events to the sign-in route,
 * and renders the provided child component for password recovery events.
 * @param {React.ReactNode} children - child components(s) whose routes are to be protected
 * @returns {Object} route to navigate back to
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
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
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
