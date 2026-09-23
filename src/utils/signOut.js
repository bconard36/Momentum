import { supabase } from "./supabaseClient";
/**
 * Signs out the current user from the local Supabase session.
 * @returns {Promise<{success: boolean, error: object | null}>} Result of the sign-out request. */
const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut({
      // Local scope signs the user out of the current session,
      // without terminating the user's other active sessions
      scope: "local",
    });

    if (error) {
      console.error("Error signing out:", error);
      return { success: false, error };
    }
    return { success: true, error: null };
  } catch (error) {
    console.error("Error signing out:", error);
    return { success: false, error };
  }
};

export default signOut;
