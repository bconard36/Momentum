-- Allows the user input for exercise name to be 
-- queried and checked for existence before id assignment.
-- Instead of using a specific ID check,
-- true was used, granting access to all users. 
-- OK because each workout entry needs to be checked for data integrity 
CREATE POLICY "exercise_check_before_id"
ON public.exercises
FOR select
TO authenticated 
USING (true);

-- Allows workouts table access 
CREATE POLICY "workouts_access"
ON public.workouts
FOR select
TO authenticated
USING (user_id = auth.uid());

-- Allows users table access 
CREATE POLICY "users_access"
ON public.users
FOR select
TO authenticated
USING (user_id = auth.uid());

-- Allows delete access to workouts table 
-- Only to authenticated users 
CREATE POLICY "delete_workouts"
ON public.workouts
FOR delete
TO authenticated 
USING (user_id = auth.uid());

-- Allows for workout editing
CREATE POLICY "workout_exercises_owner_edit_access"
ON public.workout_exercises
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM  workouts
    WHERE workouts.workout_id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM workouts
    WHERE workouts.workout_id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
  )
);