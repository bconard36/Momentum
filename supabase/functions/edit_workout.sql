CREATE OR REPLACE FUNCTION edit_workout(
    resolved_workout JSONB,
    p_workout_id uuid -- workout_id from workouts table 
)
RETURNS VOID
SECURITY DEFINER
LANGUAGE PLPGSQL
AS $$
DECLARE
    exercise jsonb;
BEGIN

    -- Check whether a workouts row exists
    IF NOT EXISTS (
        SELECT 1
        FROM workouts
        WHERE workouts.workout_id = p_workout_id
            AND workouts.user_id = auth.uid()
    ) THEN 
        RAISE EXCEPTION 'Workout Not Found / Access Denied'; -- Decide what the error message will be        
        
    END IF;

    -- Loops through data to insert updated exercise information where the exercise id  = exercise id AND workout id = workout id. 
    -- Need to pass in workoutId from EditWorkout.jsx to RPC call
    FOR exercise IN SELECT * FROM jsonb_array_elements(resolved_workout->'exercises')
        LOOP
        -- This update ASSUMES read only on name and type 
            UPDATE workout_exercises
            SET weight = (exercise->>'weight')::numeric,
                sets = (exercise->>'sets')::int,
                reps = (exercise->>'reps')::int,
                duration_minutes = (exercise->>'duration_minutes')::int,
                duration_seconds = (exercise->>'duration_seconds')::int
            WHERE workout_exercises.workout_id = p_workout_id
                AND workout_exercises.exercise_id = (exercise->>'exercise_id')::uuid;
        END LOOP;

        -- Check to see if exercise_id EXISTS in exercises
        -- Yes -> move on 
        -- No -> insert exercise object 
        INSERT INTO exercises (exercise_id, type, name)
        SELECT exercise_id, type, name
        FROM jsonb_to_recordset(resolved_workout->'exercises') AS exercise(
            exercise_id UUID,
            type VARCHAR,
            name VARCHAR
        )
        WHERE NOT EXISTS (
            SELECT 1
            FROM exercises existing
            WHERE existing.exercise_id = exercise.exercise_id
        )
        ON CONFLICT (name, type) DO NOTHING; -- safety net for rare case when two "new" UUIDs collide at the same time 
        -- rather than remapping the uuid before using it downstream, this is a rare edge case where operation will fail loudly and allow for a retry to save

        -- INSERT new exercises into the workout_exercises table 
        INSERT INTO workout_exercises (
            workout_id,
            exercise_id, 
            sets,
            reps,
            weight,
            duration_minutes,
            duration_seconds 
        )
        SELECT p_workout_id,
            exercise_id, 
            sets,
            reps,
            weight,
            duration_minutes,
            duration_seconds 
        FROM jsonb_to_recordset(resolved_workout->'exercises') AS workout_exercise(
            exercise_id UUID, 
            sets INT,
            reps INT,
            weight INT,
            duration_minutes INT,
            duration_seconds INT 
        )
        WHERE NOT EXISTS (
            SELECT *
            FROM workout_exercises 
            WHERE workout_exercises.workout_id = p_workout_id
                AND workout_exercises.exercise_id = workout_exercise.exercise_id
        );
        
        -- Delete an exercise from a workout 
        DELETE FROM workout_exercises
        WHERE NOT EXISTS (
            SELECT 1
            FROM jsonb_to_recordset(resolved_workout->'exercises') as workout_exercise(
                exercise_id UUID
            )
            WHERE workout_exercises.exercise_id = workout_exercise.exercise_id -- Correlation is needed for correlated sub query!
            -- This ties the outer row (candidate for deletion) to the inner recordset (current truth from client)
        ) 
        AND workout_exercises.workout_id = p_workout_id; -- scopes entire DELETE to just this workout
    END;
$$;