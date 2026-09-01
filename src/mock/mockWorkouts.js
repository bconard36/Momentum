/**
 * Mock workouts object containing mock workout data
 * Used for Landing Page components
 */
export const mockWorkouts = [
  {
    date: "2026-08-24",
    exercises: [
      { name: "Back Squat", type: "strength", sets: 3, reps: 10, weight: 210 },
      {
        name: "Trail Running",
        type: "duration",
        duration_minutes: 45,
        duration_seconds: 22,
      },
    ],
  },
  {
    date: "2026-08-22",
    exercises: [
      { name: "Bench Press", type: "strength", sets: 4, reps: 8, weight: 165 },
    ],
  },
  {
    date: "2026-08-20",
    exercises: [
      { name: "Deadlift", type: "strength", sets: 3, reps: 5, weight: 275 },
      {
        name: "Rowing Machine",
        type: "duration",
        duration_minutes: 20,
        duration_seconds: 0,
      },
      {
        name: "Plank",
        type: "duration",
        duration_minutes: 3,
        duration_seconds: 15,
      },
    ],
  },
];
