-- Delete Workout Function 
CREATE OR REPLACE FUNCTION delete_workout(
  p_workout_id UUID 
)
RETURNS VOID
SECURITY DEFINER 
LANGUAGE PLPGSQL
AS $$
BEGIN 

  DELETE FROM workouts 
    WHERE workouts.workout_id = p_workout_id
        AND workouts.user_id = auth.uid();
  
  EXCEPTION
    WHEN OTHERS THEN 
      RAISE EXCEPTION 'Error Deleting Workout: %', SQLERRM;
END;
$$;