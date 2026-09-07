# Momentum

**A React Fitness Tracking Application**

Momentum is a React application for logging, managing, and reviewing workouts. Users can dynamically add
or remove exercises from a workout, validate inputs using React Hook Form, and store workout history in a
PostgreSQL database through Supabase.

Momentum includes user authentication through Supabase. Users can create an account, sign in, sign out, and
manage their account credentials, including updating their email address and/or password. Supabase Auth
manages authentication while PostgreSQL functions & triggers automatically create a corresponding user
profile in the application's `public.users` table and keep it synchronized with authentication-level changes.

A public landing page introduces the application to unauthenticated visitors, previewing the workout form,
workout log, workout analytics, and fitness calculator with sample data before requiring an account.

Originally developed as the successor to [Calorie Track](https://github.com/bconard36/CalorieTrack), Momentum
expands beyond fitness calculation into workout management while laying the foundation for a full-stack
fitness platform.

# Contents

- [Current Status](#current-application-status)
- [Features](#features)
- [Backend & Database](#backend--database-development)
- [What I Learned](#what-i-learned--built-from-scratch)
- [Future Development](#future-development)

# Current Application Status

**Live Site**: [Momentum Workout Tracking](https://momentum-workout-tracking.vercel.app/)

The application currently supports:

- A public landing page previewing core features (workout form, workout log, workout analytics, calculator) with sample data for unauthenticated visitors
- User account creation through Supabase Auth
- User sign-in and sign-out
- Automatic creation of a corresponding profile in the Supabase `public.users` table
- A dynamic, personalized dashboard header that greets the authenticated user by first name
- Route protection verified against Supabase's Auth server, not just cached session data
- A shared `useAuthUser` hook providing a single, re-verified source of auth state across the application
- Account settings management for logged in users, including:
  - Email address reset, password reset, and combined email + password reset
  - Reauthentication (password confirmation) required before any password change is applied
  - Partial success/failure handling for the combined reset, so a failure on one field doesn't obscure a success on the other
  - A pending-change banner reflecting Supabase's confirm-based email update flow, so the UI never implies an email has changed before the user confirms it
  - Forced global sign-out and redirect after a successful password change, since a changed password invalidates the current session's credential everywhere
- Reusable `PasswordInput` and `EmailInput` form components shared across sign-up, sign-in, and account settings, with per-instance validation rules (e.g., strength requirements for a new password vs. simple presence for a current-password confirmation)
- Workout creation and management through React Hook Form
- Saving workouts to PostgreSQL through Supabase
- Fetching authenticated users' workout history from PostgreSQL
- Editing existing workouts, including adding, updating, and removing exercises
- Deleting workouts
- Viewing, sorting, and filtering workout history
- Basic workout analytics, calculated client-side from workout history:
  - Rolling 30 day workout count
  - Current workout streak
  - Exercise type splits
- User-facing error messaging for failed workout operations
- Unit test coverage for:
  - Creating an account (SignUp)
  - Signing in (SignIn)
  - Saving Workouts (WorkoutLog)
  - Editing Workouts (EditWorkout)
  - Deleting Workouts
  - Account settings (email reset, password reset, combined reset, reauthentication, and pending-change state)
  - Reusable `PasswordInput` and `EmailInput` components in isolation
  - Analytics calculations (30-day count, workout streak, exercise splits)

Supabase handles the following responsibilities:

- _authentication_
- _user profiles_
- _workout storage, retrieval, and edits_
- _deletion_

# Folder List

- public
- src: parent folder for components, stylesheets, and assets
  - components: parent folder for individual components
    - analytics: parent folder for analytic-specific components
      - Analytics.jsx
      - ExerciseSplits.jsx
      - ThirtyDayCount.jsx
      - WorkoutStreak.jsx
    - CalorieTrack: Fitness calculator component
      - refactored from the original [Calorie Track](https://github.com/bconard36/CalorieTrack),
        migrated into Momentum and rebuilt using `react-hook-form` for form state management and validation.
    - landingPage: Parent folder for landing page components
      - AnalyticsPreview.jsx
      - CalculatorPreview.jsx
      - Hero.jsx
      - LandingFooter.jsx
      - LandingPage.jsx
      - WorkoutFormPreview.jsx
      - WorkoutLogPreview.jsx
    - AccountSettings.jsx
    - Dashboard.jsx
    - EditWorkout.jsx
    - EmailInput.jsx
    - Header.jsx
    - NotFound.jsx
    - PasswordInput.jsx
    - ProtectedRoute.jsx
    - SignIn.jsx
    - SignUp.jsx
    - WorkoutForm.jsx
    - WorkoutLog.jsx
  - hooks: custom, reusable hooks
    - useAuthUser.js
    - useClickOutside.js
  - mock: mock data to be used for landing page renders
    - mockWorkout.js
  - styles: houses all style sheets
    - landingPage: parent folder for landing page style sheets
      - hero.css
      - landingFooter.css
      - landingPage.css
      - workoutFormPreview.css
    - accountSettings.css
    - analysis.css
    - base.css
    - calculator.css
    - editWorkout.css
    - notFound.css
    - signInSignUp.css
    - success.css
    - workoutForm.css
    - workoutLog.css
  - tests: parent test folder
    - AccountSettings.test.jsx
    - Analytics.test.jsx
    - DeleteWorkout.test.jsx
    - EditWorkout.test.jsx
    - EmailInput.test.jsx
    - ExerciseSplits.test.jsx
    - PasswordInput.test.jsx
    - setup.js
    - SignUp.test.jsx
    - SignIn.test.jsx
    - ThirtyDayCount.test.jsx
    - WorkoutForm.test.jsx
    - WorkoutStreak.test.jsx
  - utils: parent folder for utility functions
    - supabaseClient.js
  - App.jsx
  - main.jsx
- supabase: parent folder for all DB logic
  - functions: parent folder for all SQL/PGSQL functions
    - delete_workout.sql
    - edit_workout.sql
    - email_update.sql
    - get_user_workouts.sql
    - save_workout.sql
    - user_insert_function.sql
  - permissions: parent folder for all grants and policies
    - grants.sql
    - permissions.sql
  - triggers: parent folder for all DB triggers
    - email_update_trigger.sql
    - user_insert_trigger.sql
- .gitignore
- .prettierrc
- eslint.config.js
- index.html
- package-lock.json
- package.json
- README.md
- vite.config.js

# Features

## Public Landing Page

- Marketing-facing home page for unauthenticated visitors, replacing a bare sign-in form
- Preview sections for the workout form, workout log, workout analytics and fitness calculator populated from static mock data rather than real user data
- Interactive, fully functional calculator and workout form previews. The calculator tool itself requires no authentication, and the workout form mimics the input fields adapting based on workout type.
- Consistent "mock UI" visual pattern across preview sections, distinct from the real, interactive versions of the feature

## Account Settings

- Email reset, password reset, and combined email + password reset, each rendered as its own mode within a single form
- Password changes require reauthentication (re-entering the current password) before being applied, verified through a live `signInWithPassword` call rather than any client-side comparison, since the current password is never available client-side
- The combined email + password form allows partial success: a failure updating one field does not block or hide a successful update to the other, and the user is shown a specific, accurate outcome message reflecting exactly what did and didn't succeed
- Cross-field validation (new password vs. confirm password) implemented as a React Hook Form `validate` rule rather than a manual post-submit check, so a mismatch surfaces as a real field-level error instead of silently blocking submission
- A pending-email-change banner reflects Supabase's confirmation-based email update flow: the UI clearly communicates that the account continues using the old email address until the new one is confirmed, rather than implying an immediate change
- A successful password change forces a global sign-out (invalidating all active sessions, not just the current one) and redirects to sign-in, since a password change is a security-sensitive action with no client-side way to reflect the new credential in an existing session
- Reusable `PasswordInput` and `EmailInput` components extracted from three near-duplicate inline forms, with per-instance validation rules (e.g., full strength requirements for a new password field vs. a lightweight "required only" rule for confirming a current password)

## Workout Management

- Dynamic workout creation with React Hook Form
- Add, edit and remove exercises using `useFieldArray`
- Conditional workout form inputs based on workout type using `watch`
- Built-in custom form validation
- Save workouts to PostgreSQL through Supabase
- Edit existing workouts
- Delete workouts
- Retrieve workout history from the database
- View previously logged workouts
- Sort workouts by date
- Filter workouts by month
- Duration formatting using `Xm Xs` and `Xh Xm Xs` formats
- Responsive modal windows
- Graceful empty-state messaging
- User-facing error messages rendered from state, rather than errors surfacing only in the console

## Analytics

- Rolling 30-day workout count, calculated from the authenticated user's full workout history
- Current workout streak calculated by walking backward from today through consecutive logged days
  - Both calculations are pure, derived values computed from already-fetched workout data (no separate  
    network requests or stored counters), so results are always correct relative to the underlying workout log
- Strength vs. duration exercise breakdown, with total counts and percentages for each type

## Authentication

- User account creation through Supabase Auth
- Email and password authentication
- User sign-in and sign-out
- Protected application routes, verified using `supabase.auth.getUser()`
- A shared `useAuthUser` custom hook centralizing auth-state checks and re-verification across the app, used
  for both route protection/redirection and gating authenticated data fetches
- Automatic creation of a corresponding `public.users` profile through a PostgreSQL function and trigger
- A second PostgreSQL trigger keeps `public.users` synchronized when a user's email is updated through Supabase Auth, mirroring the same "auth event → application profile update" pattern used for account creation
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

A custom PostgreSQL function (`get_user_workouts`) retrieves the authenticated user's workouts and builds the related workout and exercise data into a JSON response.

The function uses the authenticated user's Supabase UUID to ensure the returned workouts belong to the current user.

The resulting data is passed through the React application and into `WorkoutLog`, where workouts can be sorted and filtered for display. After a workout is created, edited, or deleted, the application re-fetches the current workout log so the displayed data always reflects the current database state.

## Row Level Security

Supabase Row Level Security and database permissions are used to control access to workout-related tables.

Authenticated users are granted the required database permissions, while RLS policies control access to the data. Ownership-based policies restrict users to their own workouts and workout-exercise records, verified through a correlated subquery against the `workouts` table where a direct `user_id` column isn't available (as on the `workout_exercises` join table). Shared reference data, such as exercise definitions, remains readable by all authenticated users, since exercises are not user-owned.

Account settings' email and password updates go through Supabase Auth directly (`auth.updateUser`), which operates on the Auth-managed `auth.users` table rather than `public.users` — a distinction that matters, since RLS policies on `public.users` have no effect on Auth-level updates.

## Unit Testing

Momentum uses **Vitest** and **React Testing Library** for component-level unit tests, chosen over Jest for its native integration with the existing Vite build pipeline.

Supabase calls are mocked at the module level (`vi.mock`) on a per-file basis, scoped to only the methods each component actually calls, so tests run without touching the real database.

Current coverage includes sign up, sign in, save workout, edit workout, delete workout, account settings, and analytics calculation flows:

- Form rendering and field presence
- Client-side validation blocking submission before Supabase is contacted
- Correct payload shape sent to Supabase on valid submission
- Error handling and messaging when Supabase returns an authentication failure
- Conditional success message displays
- Mode-switching behavior in a multi-mode form, including that errors from a previous mode are cleared when switching
- Reauthentication gating a sensitive update, including the case where reauthentication succeeds but a downstream update still fails
- Partial success/failure messaging on multi-field updates
- Date-dependent calculation logic (rolling windows, streaks) using a pinned system time rather than the real clock, so fixture data stays valid regardless of when the suite runs

## Code Formatting

Momentum uses **Prettier** with a project-level `.prettierrc` to enforce consistent formatting across the codebase, applied via editor format-on-save. This was introduced after inconsistent editor defaults across working sessions caused unrelated files to show large, purely cosmetic diffs during branch merges — a project-level config removes the ambiguity by giving every contributor (or every session) the same formatting rules to format against.

# What I Learned / Built From Scratch

**React Hook Form**: Rather than manually managing every input with `useState`, this project uses React Hook Form to register, validate, and track form values. This reduces boilerplate while minimizing unnecessary component re-renders. The original CalorieTrack calculator was also refactored from manually managed form state and prop drilling to React Hook Form.

**Dynamic Forms with `useFieldArray`**: Exercises are managed as a dynamic array, allowing users to add or remove any number of exercises during a workout. This introduced a different approach to forms where the form structure itself changes over time.

**Conditional Form Displays with `watch`**: Workout forms display different inputs based on workout type. React Hook Form's `watch` API monitors the workout-type field and allows the relevant inputs to update dynamically.

**Cross-Field Validation**: Confirming a new password matches its confirmation field is implemented as a React Hook Form `validate` function rather than a manual comparison after submission. A manual post-submit check never runs if RHF's own field-level validation (e.g., a strength `pattern` rule) blocks submission first — folding the comparison into the field's own validation rules ensures a mismatch always produces a visible error instead of a silent, confusing submit block.

**Component Extraction & the "Rule of Three"**: Three near-identical password input blocks (with a duplicated show/hide toggle icon) were extracted into a single reusable `PasswordInput` component once the third copy-paste was about to happen. The extraction surfaced a real design need — different fields require different validation strength (a new password vs. confirming a current one) — solved with a prop that selects between two named rule sets rather than one hardcoded rule object.

**Impossible States**: Three independent boolean flags for "which reset mode is active" allowed invalid combinations (e.g., two modes appearing simultaneously) and made clearing stale error messages error-prone, since every mode-switch handler had to remember to reset every other flag. Collapsing this into a single `activeForm` state variable made the invalid combination structurally impossible rather than something to remember to prevent.

**Reauthentication vs. Route Protection**: A protected route confirms a valid session exists, but a password change additionally reverifies the specific current password via `signInWithPassword` before applying an update — a distinct, stronger guarantee than session validity alone, appropriate for a security-sensitive action.

**Auth-Level vs. Application-Level Data**: `supabase.auth.updateUser()` operates on Supabase's internally-managed `auth.users` table, not the application's `public.users` table — meaning RLS policies and grants on `public.users` have no bearing on Auth-level updates, and a `public.users` mirror column (like email) requires its own dedicated trigger to stay synchronized, following the same pattern originally used for profile creation.

**Modeling Asynchronous, Confirmation-Based State**: Supabase's email change requires a confirmation link before taking effect, meaning `user.email` continues to reflect the _old_ address for an indeterminate period after a successful update request. Rather than treating this as an edge case to route around, the UI models it directly as its own pending state with dedicated messaging, avoiding a false "success" indication for a change that hasn't actually completed yet.

**Testing Time-Dependent Logic**: Analytics calculations (30-day windows, streaks) depend entirely on the current date. Testing them safely requires pinning "now" with Vitest's fake system time and building fixture dates relative to that fixed anchor, so tests remain correct regardless of when they're actually run — rather than relying on real wall-clock time, which would make the same test pass or fail solely based on the calendar date.

**Formatting Drift Across Branches**: Long-lived feature branches without a shared, committed formatter config accumulated editor-specific formatting differences over time, which surfaced as large, misleading merge conflicts unrelated to any actual logic change. Introducing a project-level `.prettierrc` and reformatting each branch before merging (rather than during) isolated genuine logic conflicts from cosmetic noise, making merges meaningfully easier to review.

**Local Data Persistence & Migration**: Momentum originally stored workout history in browser localStorage. This provided experience serializing application data and synchronizing React state with browser storage before the application was migrated to PostgreSQL through Supabase.

**Shared Application State**: Workout state was initially lifted to the `App` component so that saved workout data could be managed centrally and passed to child components through props. As the application transitioned to database-backed storage, this structure provided a foundation for passing retrieved workout data through the application, and later for passing a shared refetch function down to editing and deletion components so the displayed log always reflects current database state.

**Custom Hook Extraction**: Auth-checking logic originally existed independently in two places (route redirection and gating an authenticated data fetch), each calling Supabase directly. Consolidating this into a single `useAuthUser` hook removed duplicated logic and ensured both consumers stay in sync if the underlying auth-check implementation ever changes.

**Date Handling & Timezone Bugs**: Comparing workout dates for analytics calculations surfaced a common JavaScript pitfall: `new Date(dateString)` parses date-only strings as UTC midnight, which shifts to the previous local day when displayed or compared in a negative UTC-offset timezone. This was resolved by parsing date components explicitly (`new Date(year, month - 1, day)`) rather than passing a raw date string to the `Date` constructor, avoiding the UTC conversion entirely.

**Derived vs Stored State**: Workout analytics (30-day count, current streak) are calculated directly from already-fetched workout data on each render, rather than stored as separate state and kept in sync via an effect. This avoids unnecessary layer of state that would need to be manually kept consistent with the source data.

**Workout History Filtering & Sorting**: The workout log derives filtered data from the saved workout collection before sorting it for display. This allows users to narrow their workout history without modifying the underlying data.

**Data Modeling**: Moving workout data from a single nested object structure into a relational database required separating users, workouts, exercises, and workout-specific exercise data into related tables. This provided practical experience with primary keys, foreign keys, join tables, and normalized data.

**Database Integration**: Momentum's frontend communicates with PostgreSQL through Supabase. Workout creation, editing, deletion, exercise resolution, and workout retrieval are handled through custom database functions and authenticated requests.

**PL/pgSQL & Reconciliation Logic**: Building the `edit_workout` function required learning PL/pgSQL's procedural constructs (guard clauses, loops, exception handling) and designing set-based reconciliation logic using correlated `EXISTS`/`NOT EXISTS` subqueries to determine which records to update, insert, or delete based on differences between submitted and existing data.

**Row Level Security Behavior**: Debugging an overly permissive policy revealed that Postgres evaluates multiple permissive RLS policies on the same table with OR logic rather than AND — meaning a single broad policy can silently override a more restrictive one on the same table. A separate RLS gap on `public.users` reinforced that a missing policy fails silently (an empty result, not an error), which required deliberately ruling out client-side causes before identifying the database as the actual source.

**Authentication Verification**: Replaced `supabase.auth.getSession()` with `supabase.auth.getUser()` for route protection. `getSession()` reads cached, unverified session data from storage, while `getUser()` makes a live request to the Auth server to re-verify the user's JWT, closing a gap where stale or tampered local session data could otherwise be trusted.

**Supabase Authentication & Database Integration**: Momentum uses Supabase Auth for account creation and email/password authentication. A PostgreSQL function and trigger automatically create a corresponding application profile in `public.users` whenever a new Auth user is created. This separates authentication data from application-specific user data while maintaining a shared UUID between the two records.

**Authentication State & Navigation**: Sign-in and sign-out functionality is integrated with React Router. Successful authentication navigates the user to the Dashboard, while successful sign-out returns the user to the sign-in route.

**State Identity in Repeated Components**: A bug in the workout deletion confirmation modal demonstrated the importance of storing the identity of a selected item rather than a simple boolean. The confirmation state was changed to hold the specific workout ID, allowing each repeated workout row to determine whether it was the selected item.

**Debugging Across the Stack**: Tracing bugs in this project frequently required distinguishing between database logic, RLS/permissions, API caching, and client-side JavaScript as separate possible causes — including a case where a PostgREST schema cache issue and a mismatched JSON payload shape produced identical-looking symptoms but required entirely different fixes.

**Unit Testing Async, Network-Dependent Components**: Writing unit tests required learning to mock Supabase at the module level and explicitly configuring and resetting each mock's resolved value per test case, since an unconfigured mock silently resolves to `undefined` rather than throwing.

# Future Development

As Momentum continues to evolve, planned improvements include:

- Expanded user profile functionality
- Extracting workout-fetching, deletion, and related state out of App.jsx into a dedicated useWorkoutLog hook, so the root component is only responsible for routing
- Further application state management improvements
- Reconciling session behavior between the standalone password-reset flow (forced global sign-out) and the combined email + password flow (no forced sign-out), so the security posture is consistent regardless of which form a user changes their password through

# Production Build

To view the production build locally:

```bash
npm run build
npm run preview
```
