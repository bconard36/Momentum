import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const Header = () => {

    const [firstName, setFirstName] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchFirstName = async (idToQuery) => {
        const { data: name, error: fetchError } = await supabase   
            .from("users")
            .select("first_name")
            .eq("user_id", idToQuery)
            .single();

        if (name) {
            setFirstName(name.first_name);
            setLoading(false);
        }

        if (fetchError) console.log(fetchError);
    }
    
    
    useEffect(() => {
        const fetchUser = async() => {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (user) {
                fetchFirstName(user.id);
            }

            if (error) console.log(error);
        }
        fetchUser();
    }, []);


    return ( 
        <header>
            <h2>Momentum</h2>
            <div>
                {loading ? (
                    <span>Loading...</span>
                ) : (
                    <span>Welcome, {firstName}</span>
                )}
            </div>
        </header>
     );
}
 
export default Header;