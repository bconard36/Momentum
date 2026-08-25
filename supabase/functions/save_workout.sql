/* 
  Saves a workout to the database
  Inserts objects into three separate tables
  workout and exercise ID generation handled in client-side JS
  user_id derived here rather than being passed in from client-side JS 
  Inserts workouts object, then exercises, then workout_exercises
*/
CREATE OR REPLACE FUNCTION save_workout(
    workout_entry JSONB,
    resolved_exercises JSONB,
    workout_exercise_list JSONB
)
RETURNS VOID
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN

    -- Insert Workout First 
    INSERT INTO workouts (workout_id, date, user_id)
    SELECT workout_id, date, auth.uid()
    FROM jsonb_to_record(workout_entry) AS workout(
        workout_id UUID,
        date DATE
    );

    -- Insert Exercises 
    -- Check for existing ID before insertion!
    INSERT INTO exercises (exercise_id, type, name)
    SELECT exercise_id, type, name
    FROM jsonb_to_recordset(resolved_exercises) AS exercise(
        exercise_id UUID,
        type VARCHAR,
        name VARCHAR
    )
    WHERE NOT EXISTS (
      SELECT 1
      FROM exercises existing
      WHERE existing.name = exercise.name
      AND existing.type = exercise.type
    );

    -- Insert into workout_exercise linking table 
    INSERT INTO workout_exercises(
        workout_id,
        exercise_id,
        sets,
        reps,
        weight,
        duration_minutes,
        duration_seconds
    )
    SELECT  
        workout_id,
        exercise_id,
        sets,
        reps,
        weight,
        duration_minutes,
        duration_seconds
    FROM jsonb_to_recordset(workout_exercise_list) AS workout_exercise(
        workout_id UUID,
        exercise_id UUID,
        sets INT,
        reps INT,
        weight INT,
        duration_minutes INT,
        duration_seconds INT
    );
EXCEPTION 
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Insertion Failed: %', SQLERRM;

END;
$$;