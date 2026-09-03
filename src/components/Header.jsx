import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
/**
 * Dynamic Header Component
 * User's first name is fetched from the database using the autheticated user_id
 * @returns {JSXElement} - dynamic header for the dashboard
 */
const Header = () => {
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFirstName = async (idToQuery) => {
    try {
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("first_name")
        .eq("user_id", idToQuery)
        .single();

      if (fetchError) throw fetchError;
      setFirstName(user.first_name);
    } catch (error) {
      console.error(`Unable to load user's name: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user) {
        fetchFirstName(user.id);
      }

      if (error) console.log(error);
    };
    fetchUser();
  }, []);

  return (
    <header>
      <div>
        {loading ? (
          <div className="loading-message-container"></div>
        ) : (
          <div className="dashboard-header-container">
            <span className="dashboard-header">Welcome, {firstName}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
