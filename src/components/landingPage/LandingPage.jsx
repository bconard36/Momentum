import { Link } from "react-router";
import Hero from "./Hero";
import WorkoutLogPreview from "./WorkoutLogPreview";
import CalculatorPreview from "./CalculatorPreview";
import WorkoutFormPreview from "./WorkoutFormPreview";
import AnalyticsPreview from "./AnalyticsPreview";
import LandingFooter from "./LandingFooter";
/**
 * Landing Page component
 * Renders preview/mock components to highlight features of the application.
 * @returns {JSXElement} - a central landing page for unauthenticated users to see application features
 */
const LandingPage = () => {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <img
          src="././favicon-momentum.svg"
          alt="a white m with blue and green graphics"
          className="landing-image"
        />
        <span className="landing-logo">Momentum</span>
        <div className="landing-nav-actions">
          <Link to="/sign-in" className="btn primary-button">
            Sign In
          </Link>
          <Link to="/sign-up" className="btn primary-button">
            Sign Up
          </Link>
        </div>
      </nav>

      <Hero />

      <section className="landing-grid">
        <div className="panel panel-wide">
          <WorkoutLogPreview />
        </div>
        {/* <div className="panel">
          <DashboardPreview />
        </div> */}
        <div className="panel">
          <WorkoutFormPreview />
        </div>
        <div className="panel">
          <CalculatorPreview />
        </div>
        <div className="panel panel-wide">
          <AnalyticsPreview />
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
