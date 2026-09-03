import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Navigate } from "react-router";

/**
 * Protected Route Component
 * Sends an HTTP request to Supabase auth server to verify User's authenticated JWT
 * Displays a loading state while user is being checked, redirects unauthenticated users to the sign-in route,
 * and renders the provided child component for authenticated users.
 * @param {React.ReactNode} children - child components(s) whose routes are to be protected
 * @returns {Object} route to navigate back to
 * @returns {JSX.Element} Loading state, redirect, or protected child component
 */
const ProtectedRoute = ({ children }) => {
  // Track state for loading and authentication
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth
      .getUser() // Retrieves authenticated user data
      .then(({ data: { user } }) => {
        setAuthenticated(!!user); // Convert user object to a boolean: user exists = authenticated
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-message-container">
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
