/**
Grants select on exercises to authenticated users 
First step in allowing exercise name to be checked 
Second step is granting access — RLS is second layer of security
*/
GRANT SELECT ON TABLE public.exercises TO authenticated;

/**
Grants select on workouts to authenticated users 
*/
GRANT SELECT ON TABLE public.workouts TO authenticated;

/**
Grants select on workout_exercises to authenticated users 
*/
GRANT SELECT ON TABLE public.workout_exercises TO authenticated;

/**
Grants delete on workout to authenticated users
*/
GRANT DELETE ON TABLE public.workouts TO authenticated;

/** 
  Grants insert, update, and delete on workout_exercises 
*/
GRANT INSERT ON TABLE public.workout_exercises TO authenticated;
GRANT UPDATE ON TABLE public.workout_exercises TO authenticated;
GRANT DELETE ON TABLE public.workout_exercises TO authenticated;

/** 
  Grant execute priveleges on edit_workout
*/
GRANT EXECUTE ON FUNCTION public.edit_workout(jsonb, uuid) TO authenticated;

/**
  Grants select on the users table for authenticated users 
*/
GRANT SELECT ON TABLE public.users TO authenticated;