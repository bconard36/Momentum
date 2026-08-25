/**
  Fetches all workouts belonging to the currently authenticated user and 
  returns them as a single JSOB array, with each workout's associated
  exercises nested inside it. 

  @returns {JSONB} - An array of workout objects ordered by date, or empty array if no workouts
*/
CREATE OR REPLACE FUNCTION get_user_workouts()
RETURNS JSONB
LANGUAGE SQL 
AS $$
/**
  jsonb_agg() return SQL NULL (not JSON null, and not '[]') when it aggregates over 0 rows (i.e. no workouts)
  COALESCE catches the null and substitutes '[]'::jsonb, so result can always be treated as a JSON array
*/
SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'workout_id', workouts.workout_id,
          'date', workouts.date,
          'exercises', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'exercise_id', exercises.exercise_id,
                'type', exercises.type,
                'name', exercises.name,
                'weight', workout_exercises.weight,
                'sets', workout_exercises.sets,
                'reps', workout_exercises.reps,
                'duration_minutes', workout_exercises.duration_minutes,
                'duration_seconds', workout_exercises.duration_seconds
              )
            )
            FROM workout_exercises 
              JOIN exercises    
                ON exercises.exercise_id = workout_exercises.exercise_id
            WHERE workout_exercises.workout_id = workouts.workout_id
          )
        )
        ORDER BY workouts.date DESC
      ),
      '[]'::jsonb
)
FROM workouts
WHERE workouts.user_id = auth.uid();

$$;