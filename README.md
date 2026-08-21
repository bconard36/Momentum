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
- A dynamic, personalized dashboard header that greets the authenticated user by first name
- Route protection verified against Supabase's Auth server, not just cached session data
- Workout creation and management through React Hook Form
- Saving workouts to PostgreSQL through Supabase
- Editing existing workouts, including adding, updating, and removing exercises
- Deleting workouts
- Fetching authenticated users' workout history from PostgreSQL
- Viewing, sorting, and filtering workout history
- User-facing error messaging for failed workout operations
- Unit test coverage for the sign-up and sign-in flows

Workout data has **been migrated to the database.** Supabase is now responsible for authentication, user profiles, 
and workout storage, retrieval, editing, and deletion.

# Folder List
- public
- src: parent folder for components, stylesheets, and assets
    - components: parent folder for individual components
        - CalorieTrack: Calculator component 
            - refactored from the original [Calorie Track](https://github.com/bconard36/CalorieTrack), 
            migrated into Momentum and rebuilt using `react-hook-form` for form state management and validation.  
        - Dashboard.jsx
        - EditWorkout.jsx
        - Header.jsx
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
        - SignUp.test.jsx
        - SignIn.test.jsx
        - setup.js
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
- Vitest

# Features

## Workout Management 
- Dynamic workout creation with React Hook Form
- Add and remove exercises using `useFieldArray`
- Conditional workout form inputs based on workout type using `watch`
- Built-in custom form validation
- Save workouts to PostgreSQL through Supabase
- Edit existing workouts, including adding new exercises, updating existing exercise metrics, and removing exercises
- Delete workouts
- Retrieve workout history from the database
- View previously logged workouts
- Sort workouts by date
- Filter workouts by month
- Duration formatting using `Xm Xs` and `Xh Xm Xs` formats
- Responsive modal windows
- Graceful empty-state messaging
- User-facing error messages rendered from state, rather than errors surfacing only in the console

## Authentication 
- User account creation through Supabase Auth
- Email and password authentication
- User sign-in and sign-out
- Protected application routes, verified using `supabase.auth.getUser()`
    - `getUser()` re-verifies the user's JWT against the Supabase Auth server on each check, rather than trusting
    unverified, cached session data the way `getSession()` does
- Automatic creation of a corresponding `public.users` profile through a PostgreSQL function and trigger
- Shared UUID between the Supabase Auth user and application profile
- Foreign key relationship between the Auth user and application profile
- A dynamic dashboard header that displays the authenticated user's first name, queried from `public.users`
using their verified user ID

## Backend & Database Development
Momentum uses **PostgreSQL through Supabase** for persistent application data.

The database separates workout data into related tables:

- **Users** — Stores authenticated user accounts.
- **Workouts** — Stores each workout and associates it with a user.
- **Exercises** — Stores unique exercises with their name and exercise type.
- **Workout Exercises** — Joins workouts and exercises while storing workout-specific metrics such as sets, reps, weight, and duration.

## Exercise Resolution
When a workout is submitted or edited, Momentum normalizes each exercise name and type before checking the `exercises` table for an existing match.

If a matching exercise exists, its existing `exercise_id` is reused. If no match is found, a new UUID is generated for the exercise.

Exercise matching uses both the normalized exercise name and exercise type so that exercises with the same name can still be represented separately when their types differ.

This resolution logic runs both when a new workout is first created and when a user adds a new exercise to an existing workout during editing, ensuring exercises stay deduplicated regardless of when they're introduced.

## Workout Data Preparation & Insertion
Before database insertion, the submitted workout is separated into records for the related tables:

- A workout record containing the workout ID, authenticated user ID, and date.
- Workout-exercise records containing the shared workout ID, exercise ID, and exercise-specific metrics.
- New exercise records when a submitted exercise does not already exist in the database.
    - `Promise.all()` is used when resolving exercises asynchronously so that the resulting arrays contain the resolved exercise data rather than unresolved Promise objects.

A custom PGSQL function then handles the inserts of all records into their respective tables.

## Workout Editing
Editing a workout is handled through a dedicated PostgreSQL function (`edit_workout`) that reconciles the submitted form data against the current database state in a single transaction.

The function evaluates each exercise in the submitted workout against four possible cases:

1. **Already linked and unchanged/updated** — the exercise is already attached to this workout, and its metrics (sets, reps, weight, duration) are updated in place.
2. **Exists elsewhere, newly added to this workout** — the exercise already exists in the `exercises` table (from another workout) but isn't yet linked to this one, so only a new link is created.
3. **Entirely new exercise** — the exercise doesn't exist anywhere yet, so it's inserted into `exercises` first, then linked to the workout.
4. **Removed from the workout** — an exercise that exists in the database for this workout but is no longer present in the submitted data is unlinked (deleted from the join table only; the exercise definition itself and the workout remain intact).

The function begins with an ownership guard clause, confirming the workout belongs to the authenticated user before any changes are made, and raises an exception otherwise.

## Workout Deletion
Deleting a workout is handled through a dedicated PostgreSQL function (`delete_workout`) that verifies the workout belongs to the authenticated user before removing it. Deleting a workout cascades to remove its associated workout-exercise links, while the underlying exercise definitions (shared, reusable data) remain untouched.

## Workout Data Retrieval
A PostgreSQL function retrieves the authenticated user's workouts and builds the related workout and exercise data into a JSON response.

The function uses the authenticated user's Supabase UUID to ensure the returned workouts belong to the current user.

The resulting data is passed through the React application and into `WorkoutLog`, where workouts can be sorted and filtered for display. After a workout is created, edited, or deleted, the application re-fetches the current workout log so the displayed data always reflects the current database state.

## Row Level Security
Supabase Row Level Security and database permissions are used to control access to workout-related tables.

Authenticated users are granted the required database permissions, while RLS policies control access to the data. Ownership-based policies restrict users to their own workouts and workout-exercise records, verified through a correlated subquery against the `workouts` table where a direct `user_id` column isn't available (as on the `workout_exercises` join table). Shared reference data, such as exercise definitions, remains readable by all authenticated users, since exercises are not user-owned.

The `public.users` table also required its own explicit `GRANT` and RLS `SELECT` policy once it began being queried directly (for the dashboard header) rather than only through a `SECURITY DEFINER` function — a reminder that RLS silently returns zero rows rather than throwing an error when no policy grants access, which can look identical to an empty database if the two aren't distinguished carefully.

## Unit Testing
Momentum uses **Vitest** and **React Testing Library** for component-level unit tests, chosen over Jest for its native integration with the existing Vite build pipeline.

Supabase calls are mocked at the module level (`vi.mock`) on a per-file basis, scoped to only the methods each component actually calls, so tests run without touching the real database.

Current coverage includes the sign-up and sign-in flows:

- Form rendering and field presence
- Client-side validation blocking submission before Supabase is contacted
- Correct payload shape sent to Supabase on valid submission
- Error handling and messaging when Supabase returns an authentication failure

# What I Learned / Built From Scratch

**React Hook Form**: Rather than manually managing every input with `useState`, this project uses React Hook Form to register, validate, and track form values. This reduces boilerplate while minimizing unnecessary component re-renders. The original CalorieTrack calculator was also refactored from manually managed form state and prop drilling to React Hook Form.

**Dynamic Forms with `useFieldArray`**: Exercises are managed as a dynamic array, allowing users to add or remove any number of exercises during a workout. This introduced a different approach to forms where the form structure itself changes over time.

**Conditional Form Displays with `watch`**: Workout forms display different inputs based on workout type. React Hook Form's `watch` API monitors the workout-type field and allows the relevant inputs to update dynamically.

**Local Data Persistence & Migration**: Momentum originally stored workout history in browser localStorage. This provided experience serializing application data and synchronizing React state with browser storage before the application was migrated to PostgreSQL through Supabase.

**Shared Application State**: Workout state was initially lifted to the `App` component so that saved workout data could be managed centrally and passed to child components through props. As the application transitioned to database-backed storage, this structure provided a foundation for passing retrieved workout data through the application, and later for passing a shared refetch function down to editing and deletion components so the displayed log always reflects current database state.

**Workout History Filtering & Sorting**: The workout log derives filtered data from the saved workout collection before sorting it for display. This allows users to narrow their workout history without modifying the underlying data.

**Data Modeling**: Moving workout data from a single nested object structure into a relational database required separating users, workouts, exercises, and workout-specific exercise data into related tables. This provided practical experience with primary keys, foreign keys, join tables, and normalized data.

**Database Integration**: Momentum's frontend communicates with PostgreSQL through Supabase. Workout creation, editing, deletion, exercise resolution, and workout retrieval are handled through database functions and authenticated requests.

**PL/pgSQL & Reconciliation Logic**: Building the `edit_workout` function required learning PL/pgSQL's procedural constructs (guard clauses, loops, exception handling) and designing set-based reconciliation logic using correlated `EXISTS`/`NOT EXISTS` subqueries to determine which records to update, insert, or delete based on differences between submitted and existing data.

**Row Level Security Behavior**: Debugging an overly permissive policy revealed that Postgres evaluates multiple permissive RLS policies on the same table with OR logic rather than AND — meaning a single broad policy can silently override a more restrictive one on the same table. A separate RLS gap on `public.users` reinforced that a missing policy fails silently (an empty result, not an error), which required deliberately ruling out client-side causes before identifying the database as the actual source.

**Authentication Verification**: Replaced `supabase.auth.getSession()` with `supabase.auth.getUser()` for route protection. `getSession()` reads cached, unverified session data from storage, while `getUser()` makes a live request to the Auth server to re-verify the user's JWT, closing a gap where stale or tampered local session data could otherwise be trusted.

**Supabase Authentication & Database Integration**: Momentum uses Supabase Auth for account creation and email/password authentication. A PostgreSQL function and trigger automatically create a corresponding application profile in `public.users` whenever a new Auth user is created. This separates authentication data from application-specific user data while maintaining a shared UUID between the two records.

**Authentication State & Navigation**: Sign-in and sign-out functionality is integrated with React Router. Successful authentication navigates the user to the Dashboard, while successful sign-out returns the user to the sign-in route.

**State Identity in Repeated Components**: A bug in the workout deletion confirmation modal demonstrated the importance of storing the identity of a selected item rather than a simple boolean. The confirmation state was changed to hold the specific workout ID, allowing each repeated workout row to determine whether it was the selected item.

**Debugging Across the Stack**: Tracing bugs in this project frequently required distinguishing between database logic, RLS/permissions, API caching, and client-side JavaScript as separate possible causes — including a case where a PostgREST schema cache issue and a mismatched JSON payload shape produced identical-looking symptoms but required entirely different fixes.

**Unit Testing Async, Network-Dependent Components**: Writing tests for the sign-up and sign-in forms required learning to mock Supabase at the module level and explicitly configure each mock's resolved value per test case, since an unconfigured mock silently resolves to `undefined` rather than throwing — meaning a "failure path" test will silently exercise the success path instead unless the mock is deliberately told to fail.

# Future Development

As Momentum continues to evolve, planned improvements include:

- Unit test coverage for `WorkoutForm` and `EditWorkout`
- Workout statistics and progress tracking
- Dashboard analytics
- Expanded user profile functionality
- Further application state management improvements
- Production deployment

# Production Build

To view the production build locally:

```bash
npm run build
npm run preview
```