/**
 * Supabase Client Constructor 
 
 */
import { createClient } from "@supabase/supabase-js";

const supabaseURL = import.meta.env.VITE_API_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_API_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseURL, supabaseKey);

// How should a user row be created?
// Database Trigger — Postgres function that fires whenever a row is inserted into auth.users
// Function inserts the matching row into users table server-side
// first_name and last_name should be in the db trigger 

// auth.users enforces unique email
// Unique constraint kept for email in users table for data integrity

// With email being stored in public and auth, an INSERT trigger is needed on auth.users
// If UPDATE email is a feature, an UPDATE trigger is also needed! 

// 8/12/26 - Build UI for login and create account first. Ensure the proper data is captured. Then begin DB operations. 