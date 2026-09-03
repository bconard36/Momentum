import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/base.css";
import "./styles/signInSignUp.css";
import "./styles/editWorkout.css";
import "./styles/calculator.css";
import "./styles/workoutForm.css";
import "./styles/workoutLog.css";
import "./styles/success.css";
import "./styles/notFound.css";
import "./styles/landingPage/landingPage.css";
import "./styles/landingPage/hero.css";
import "./styles/landingPage/workoutFormPreview.css";
import "./styles/analysis.css";
import "./styles/landingPage/landingFooter.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
