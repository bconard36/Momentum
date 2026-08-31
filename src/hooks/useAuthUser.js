import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

const useAuthUser = () => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return user;
};

export default useAuthUser;
