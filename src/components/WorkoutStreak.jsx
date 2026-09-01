import { useState } from "react";

const WorkoutStreak = (workouts) => {
  const workoutDates = workouts.map((workout) => {
    const dateOnly = workout.date;
    return dateOnly;
  });

  return <p>{console.log(workoutDates)}</p>;
};

export default WorkoutStreak;
