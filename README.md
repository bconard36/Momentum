# Momentum
**A React Fitness Tracking Application**

Momentum is a React application for logging, managing, and reviewing workouts. Users can dynamically add
or remove exercises from a workout, validate inputs using React Hook Form, and store workout history in a 
PostgreSQL database through Supabase.

Momentum includes user authentication through Supabase. Users can create an account, sign in, and sign out.
Supabase Auth manages authentication while a PostgreSQL function & trigger automatically create a corresponding
user profile in the application's `public.users` table.

Originally developed as the successor to [Calorie Track](https://github.com/bconard36/CalorieTrack), Momentum
expands beyond fitness calculation into workout management while laying the foundation for a full-stack
fitness platform. 

**Live Site**: _Coming soon!_

# Current Application Status 
Momentum is currently in active development.

The application currently supports:

- User account creation through Supabase Auth
- User sign-in and sign-out
- Automatic creation of a corresponding profile in the Supabase public.users table
- Workout creation and management through React Hook Form
- Saving workouts to PostgreSQL through Supabase
- Fetching authenticated users' workout history from PostgreSQL
- Viewing, sorting, and filtering workout history

Workout data has **has been migrated to the database.** Supabase is now responsible for authentication, user profiles, 
and workout storage and retrieval.

# Folder List
- public
- src: parent folder for components, stylesheets, and assets
    - components: parent folder for individual components
        - CalorieTrack: Calculator component 
            - refactored from the original [Calorie Track](https://github.com/bconard36/CalorieTrack), 
            migrated into Momentum and rebuilt using `react-hook-form` for form state management and validation.  
        - Dashboard.jsx
        - NotFound.jsx
        - SignIn.jsx
        - SignUp.jsx
        - WorkoutForm.jsx
        - WorkoutLog.jsx
    - styles: houses all style sheets 
        - base.css
        - calculator.css
        - notFound.css
        - success.css
        - workoutForm.css
        - workoutLog.css
    - tests: parent test folder 
    - utils: parent folder for utility functions
        - supabaseClient.js
- App.jsx
- main.jsx
- .gitignore
- eslint.config.js
- index.html
- package-lock.json
- package.json
- README.md
- vite.config.js

# Features

## Workout Management 
- Dynamic workout creation with React Hook Form
- Add and remove exercises using `useFieldArray`
- Conditional workout form inputs based on workout type using `watch`
- Built-in custom form validation
- Save workouts to PostgreSQL through Supabase
- Retrieve workout history from the database
- View previously logged workouts
- Sort workouts by date
- Filter workouts by month
- Duration formatting using `Xm Xs` and `Xh Xm Xs` formats
- Responsive modal windows
- Graceful empty-state messaging

## Authentication 
- User account creation through Supabase Auth
- Email and password authentication
- User sign-in and sign-out
- Protected application routes
- Automatic creation of a corresponding `public.users` profile through a PostgreSQL function and trigger
- Shared UUID between the Supabase Auth user and application profile
- Foreign key relationship between the Auth user and application profile

## Backend & Database Development
Momentum uses **PostgreSQL through Supabase** for persistent application data.

The database separates workout data into related tables:

- **Users** — Stores authenticated user accounts.
- **Workouts** — Stores each workout and associates it with a user.
- **Exercises** — Stores unique exercises with their name and exercise type.
- **Workout Exercises** — Joins workouts and exercises while storing workout-specific metrics such as sets, reps, weight, and duration.

## Exercise Resolution
When a workout is submitted, Momentum normalizes each exercise name and type before checking the `exercises` table for an existing match.

If a matching exercise exists, its existing `exercise_id` is reused. If no match is found, a new UUID is generated for the exercise.

Exercise matching uses both the normalized exercise name and exercise type so that exercises with the same name can still be represented separately when their types differ.

## Workout Data Preparation & Insertion
Before database insertion, the submitted workout is separated into records for the related tables:

- A workout record containing the workout ID, authenticated user ID, and date.
- Workout-exercise records containing the shared workout ID, exercise ID, and exercise-specific metrics.
- New exercise records when a submitted exercise does not already exist in the database.
    - `Promise.all()` is used when resolving exercises asynchronously so that the resulting arrays contain the resolved exercise data rather than unresolved Promise objects.

A custom PGSQL function then handles the inserts of all records into their respective tables.

## Workout Data Retrieval
A PostgreSQL function retrieves the authenticated user's workouts and builds the related workout and exercise data into a JSON response.

The function uses the authenticated user's Supabase UUID to ensure the returned workouts belong to the current user.

The resulting data is passed through the React application and into `WorkoutLog`, where workouts can be sorted and filtered for display.

## Row Level Security
Supabase Row Level Security and database permissions are used to control access to workout-related tables.

Authenticated users are granted the required database permissions, while RLS policies control access to the data.

# What I Learned / Built From Scratch

**React Hook Form**: Rather than manually managing every input with `useState`, this project uses React Hook Form to register, validate, and track form values. This reduces boilerplate while minimizing unnecessary component re-renders. The original CalorieTrack calculator was also refactored from manually managed form state and prop drilling to React Hook Form.

**Dynamic Forms with `useFieldArray`**: Exercises are managed as a dynamic array, allowing users to add or remove any number of exercises during a workout. This introduced a different approach to forms where the form structure itself changes over time.

**Conditional Form Displays with `watch`**: Workout forms display different inputs based on workout type. React Hook Form's `watch` API monitors the workout-type field and allows the relevant inputs to update dynamically.

**Local Data Persistence & Migration**: Momentum originally stored workout history in browser localStorage. This provided experience serializing application data and synchronizing React state with browser storage before the application was migrated to PostgreSQL through Supabase.

**Shared Application State**: Workout state was initially lifted to the `App` component so that saved workout data could be managed centrally and passed to child components through props. As the application transitioned to database-backed storage, this structure provided a foundation for passing retrieved workout data through the application.

**Workout History Filtering & Sorting**: The workout log derives filtered data from the saved workout collection before sorting it for display. This allows users to narrow their workout history without modifying the underlying data.

**Data Modeling**: Moving workout data from a single nested object structure into a relational database required separating users, workouts, exercises, and workout-specific exercise data into related tables. This provided practical experience with primary keys, foreign keys, join tables, and normalized data.

**Database Integration**: Momentum's frontend communicates with PostgreSQL through Supabase. Workout creation, exercise resolution, and workout retrieval are handled through database functions and authenticated requests.

**Supabase Authentication & Database Integration**: Momentum uses Supabase Auth for account creation and email/password authentication. A PostgreSQL function and trigger automatically create a corresponding application profile in `public.users` whenever a new Auth user is created. This separates authentication data from application-specific user data while maintaining a shared UUID between the two records.

**Authentication State & Navigation**: Sign-in and sign-out functionality is integrated with React Router. Successful authentication navigates the user to the Dashboard, while successful sign-out returns the user to the sign-in route.

**State Identity in Repeated Components**: A bug in the workout deletion confirmation modal demonstrated the importance of storing the identity of a selected item rather than a simple boolean. The confirmation state was changed to hold the specific workout ID, allowing each repeated workout row to determine whether it was the selected item.

# Future Development

As Momentum continues to evolve, planned improvements include:

- Complete database-backed workout deletion
- Edit existing workouts
- Workout statistics and progress tracking
- Dashboard analytics
- Expanded user profile functionality
- Improved authentication feedback and error handling
- Further application state management improvements
- Production deployment

# Production Build

To view the production build locally:

```bash
npm run build
npm run preview