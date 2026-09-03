import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

/**
 * Hook that retrieves the current authenticated user and listens for auth state changes
 * Sets up a real-time listener that updates when the user logs in/out
 *
 * @returns {Object | undefined} Current user object or undefined
 */

export function useAuthUser() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    // Set initial user
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    // Set real-time listener to watch for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      // Runs whenever auth state changes
      supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return user;
}
