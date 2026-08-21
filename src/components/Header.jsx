import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const Header = () => {

    const [username, setUsername] = useState("guest");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: {user}, error } = await supabase.auth.getUser();

            if (user) {
                const fetchUsername = async () => {
                    const { data: username, error: userError } = await supabase
                        .from("users")
                        .select("first_name")
                        .eq("user_id", user.id);

                    if (userError) throw error;
                    if (username) {
                        setUsername(username);
                        setIsLoading(false);
                    }
                }
            }
        }
    })

    return ( 
        <header>
            <h2>Momentum</h2>
            <div>
                {isLoading ? (
                    <span>Loading...</span>
                ) : (
                    <span>Welcome, {username}</span>
                )}
            </div>
        </header>
     );
}
 
export default Header;