import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Navigate } from "react-router";

/**
 * Protected Route Component 
 * Checks the current Supabase authentication session before rendering protected content. 
 * Displays a loading state while the session is being checked, redirects unauthenticated users to the sign-in route, 
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
        supabase.auth.getUser() // Retrieves user session data
            .then(({ data: { user } }) => {
                setAuthenticated(!!user); // Convert session value to a boolean: session exists = authenticated 
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="loading-message">Loading...</div>
    }

    if (!authenticated) {
        return <Navigate to="/" replace />
    }

    return children;
}

export default ProtectedRoute;