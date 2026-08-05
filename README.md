# Momentum
**A React Fitness Tracking Application**

Momentum is a React application for logging, managing, and reviewing workouts. Users can dynamically add
or remove exercises from a workout, validate inputs using React Hook Form, and persist workout history
in localStorage. 

Originally developed as the successor to [Calorie Track](https://github.com/bconard36/CalorieTrack), Momentum
expands beyond fitness calculation into workout management while laying the foundation for a future full-stack
fitness platform. 

**Live Site**: _Coming soon!_

# Folder List
- public
- src: parent folder for components, stylesheets, and assets
    - components: parent folder for individual components
        - CalorieTrack: Calculator component source code folder
        - Dashboard.jsx
        - WorkoutForm.jsx
        - WorkoutLog.jsx
    - styles: houses all style sheets 
        - base.css
        - workout.css
    - tests: parent test folder 
    - utils: parent folder for utility functions
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
Current features include: 
- Dynamic workout creation with React Hook Form
- Add and remove exercises using `useFieldArray`
- Conditional workout form based on type using `watch`
- Built-in custom form validation
- Workout history stored in localStorage
- View previously logged workouts 
- Delete individual workouts
- Responsive modal windows
- Graceful empty-state messaging

# Planned Features
- Exercise editing
- Workout statistics
- Progress tracking
- Dashboard analytics
- Database integration (SQL)
- REST API backend
- User accounts

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

# What I Learned / Built From Scratch

**React Hook Form**: Rather than manually managing every input with `useState`, this 
project uses React Hook Form to register, validate, and track form values. This 
significantly reduces boilerplate while improving performance by minimizing unnecessary
component re-renders. 

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

**Data Modeling**: Each workout is represented as a single object containing: 
- Unique identifier
- Workout date
- Collection of exercises
  
Each exercise stores: 
- Name
- Weight
- Sets
- Repetitions
- Exercise Type

**Single Source of Truth for Form Data**: A bug in the workout log modal traced back to reading 
conditional form data from two different places (log and form) rather than one — a good reminder that
once state needs to be consistent across components, it should flow from one truthy source rather than 
being re-read independently in more than one place. 
  
Designing this structure with future database integration in mind makes the transition to 
a SQL backend significantly easier. 

**Future Refactoring Goals**: As Momentum evolves into a full-stack application, planned improvements include:
- Lifting workout state to a shared parent component
- Replacing localStorage with a SQL database and REST API
- Editing existing workouts
- Improved state management
- User authentication
- Workout analytics dashboard

# Tools Used
- React
- React Hook Form
- React Hook Form `useFieldArray`
- JavaScript (ES6+)
- Vite
- localStorage API
- npm
- CSS3
- VS Code
- Git 
- GitHub
