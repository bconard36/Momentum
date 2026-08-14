# Momentum
**A React Fitness Tracking Application**

Momentum is a React application for logging, managing, and reviewing workouts. Users can dynamically add
or remove exercises from a workout, validate inputs using React Hook Form, and persist workout history in localStorage. 

Momentum also includes the foundation of user authentication using Supabase. Users can currently create an account,
sign in, and sign out. Supabase Auth manages authentication while a database function and trigger automatically 
create a corresponding user profile in the application's `public.users` table.

Originally developed as the successor to [Calorie Track](https://github.com/bconard36/CalorieTrack), Momentum
expands beyond fitness calculation into workout management while laying the foundation for a future full-stack
fitness platform. 

**Live Site**: _Coming soon!_

# Current Application Status 
Momentum is currently in active development.

The application currently supports:

- User account creation through Supabase Auth
- User sign-in and sign-out
- Automatic creation of a corresponding profile in the Supabase public.users table
- Workout creation and management through React Hook Form
- Workout history stored in browser localStorage

Workout data has **not yet been migrated to the database.** At this stage, Supabase is being used for user authentication and profile management while workout functionality continues to use the existing client-side localStorage implementation.

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
- Workout history stored in localStorage
- Shared workout state lifted to the `App` component and passed to child components through props
- View previously logged workouts
- Sort previously logged workouts by date
- Filter previously logged workouts by month
- Delete individual workouts
- Duration formatting in workout history using `Xm Xs` and `Xh Xm Xs` formats
- Responsive modal windows
- Graceful empty-state messaging

## Authentication 
- User account creation through Supabase Auth
- Email and password authentication
- User sign-in
- User sign-out
- Client-side navigation between authentication and application routes
- Automatic creation of a corresponding public.users profile through a PostgreSQL database function and trigger
- User UUID shared between Supabase Auth and the application's public.users table
- Foreign key relationship between the Auth user and application profile

# Planned Features

## Database & Backend 
- Migrate workout data from localStorage to PostgreSQL/Supabase
- Database-backed workout creation and retrieval
- Database-backed workout editing and deletion
- REST/API layer for workout data
- Row Level Security policies for user-specific workout data

## Workout Features
- Exercise editing
- Workout statistics
- Progress tracking
- Dashboard analytics

# Production Build

- To view the production build locally:
    - npm run build
    - npm run preview
    - Open a browser and navigate to the URL shown in the terminal (typically http://localhost:5173/)

# Development

- Open the root folder in VS Code (or preferred code editor)
    - Momentum
- Install dependencies 
    - npm install
- Run the development server
    - npm run dev
- Open a browser of your choice and navigate to:
    - http://localhost:5173/

## Backend & Database Development
Momentum is being expanded from a front-end/localStorage application into a full-stack application using **PostgreSQL through Supabase**.

The current database structure separates workout data into related tables:

- **Users** — Stores authenticated user accounts.
- **Workouts** — Stores each workout and associates it with a user.
- **Exercises** — Stores unique exercises with their name and exercise type.
- **Workout Exercises** — Joins workouts and exercises while storing workout-specific metrics such as sets, reps, weight, and duration.

### Exercise Resolution
When a workout is submitted, Momentum normalizes each exercise name and type before checking the `exercises` table for an existing match.

If a matching exercise exists, its existing `exercise_id` is reused. If no match is found, a new UUID is generated for the exercise.

Exercise matching uses both the normalized exercise name and exercise type so that exercises with the same name can still be represented separately when their types differ.

### Workout Data Preparation
Before database insertion, the submitted workout is separated into records for the related tables:

- A workout record containing the workout ID, authenticated user ID, and date.
- Workout-exercise records containing the shared workout ID, exercise ID, and exercise-specific metrics.
- New exercise records when a submitted exercise does not already exist in the database.

`Promise.all()` is used when resolving exercises asynchronously so that the resulting arrays contain the resolved exercise data rather than unresolved Promise objects.

# What I Learned / Built From Scratch

**React Hook Form**: Rather than manually managing every input with `useState`, this 
project uses React Hook Form to register, validate, and track form values. This 
significantly reduces boilerplate while improving performance by minimizing unnecessary
component re-renders. Additionally, this project features a refactored version of the original
CalorieTrack calculator, replacing manually managed form state and prop-drilling with React
Hook Form. 

**Dynamic Forms with `useFieldArray`**: Exercises are managed as a dynamic array, allowing users 
to add or remove any number of exercises during a workout. This introduced a different way of 
thinking about forms, where the form structure itself changes over time instead of remaining fixed.

**Conditional Form Displays with `watch`**: Workout forms are displayed based on workout type, 
allowing users to log workouts of different styles with different metrics to track. This was solved
by using React Form's `watch` API to subscribe to the workout-type field and re-render the relevant
form inputs whenever it changes. 

**Local Data Persistence**: Workout history is stored in browser localStorage, allowing users 
to close and reopen the application without losing their logged workouts. This also provided 
experience serializing application data and synchronizing React state with browser storage. 

**Shared Application State**: Workout state was lifted to the `App` component so that localStorage
could be read and managed by a shared parent component. The saved workout data and related functions 
are then passed to child components through props. This established a single source of truth for 
saved workout data while keeping the current application structure simple, avoiding unnecessary
state-mamagement libraries.

**Workout History Filtering & Sorting**: The workout log includes filtering by month and sorting by 
workout date. Filtered data is derived from the saved workout state before being sorted for display, 
allowing users to narrow their workout history while preserving the original saved data. 

**Data Modeling**: Each workout is represented as a single object containing: 
- Unique identifier
- Workout date
- Collection of exercises
  
Each exercise stores: 
- Type
- Name
- _For Duration-Based Exercises_:
    - Duration in minutes and seconds
- _For Strength-Based Exercises_:
    - Weight
    - Sets
    - Repetitions

**Single Source of Truth for Form Data**: A bug in the workout log modal traced back to reading 
conditional form data from two different places (log and form) rather than one — a good reminder that
once state needs to be consistent across components, it should flow from one single source of truth rather than 
being re-read independently in more than one place. 

**State Identity in Repeated Components**: A separate bug was found in the delete workout confirmation overlay — 
regardless of what workout was selected for deletion, the delete button in the confirmation overlay
always deleted the _last_ workout in the array. This was traced back to how state was managed across repeated 
modal instances of a list. Previously, one piece of state was being used to represent the specific workout
pending deletion. However, that state was a Boolean, which could never hold a value like a workout ID — so every
row in the list was reading the same true/false flag instead of checking its own identity. This was remedied by 
switching the state to hold a specific value (the workout ID) rather than a boolean, and conditionally rendering
the delete confirmation window based on a match against that ID. 

**Supabase Authentication & Database Integration**: Momentum now uses Supabase Auth for account creation and email/password authentication. A PostgreSQL database function and trigger automatically create a corresponding application profile in `public.users` whenever a new Auth user is created. This separates authentication data from application-specific user data while maintaining a shared UUID between the two records.

**Database Relationships & Cascading Deletes**: The `public.users` table uses the Supabase Auth user's UUID as its identifier and maintains a foreign key relationship to `auth.users`. The relationship uses cascading deletion so that deleting an Auth user automatically removes the associated application profile.

**Authentication State & Navigation**: Sign-in and sign-out functionality is integrated with React Router. Successful authentication navigates the user to the Dashboard, while successful sign-out returns the user to the sign-in route.
  
Designing this structure with future database integration in mind makes the transition to 
a SQL backend significantly easier. 

# Future Refactor Goals

As Momentum evolves into a full-stack application, planned improvements include:
- Replacing localStorage workout storage with PostgreSQL/Supabase
- Connecting workouts to authenticated users
- Implementing database-backed workout CRUD operations
- Adding Row Level Security to protect user-specific workout data
- Building a REST/API layer for workout data
- Editing existing workouts
- Improving application state management
- Adding workout analytics and progress tracking
- Expanding user profile functionality
- Improving authentication feedback and error handling

# Tools Used
- React
- React Hook Form
    - `useForm`
    - `useFieldArray`
    - `watch`
- React Router
- Supabase
    - Supabase Auth
    - PostgreSQL
    - Database functions 
    - Database triggers 
    - Row Level Security 
- JavaScript (ES6+)
- Vite
- localStorage API
- npm
- CSS3
- VS Code
- Git 
- GitHub