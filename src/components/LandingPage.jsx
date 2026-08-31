import { Link } from "react-router";
import Hero from "./Hero";
import WorkoutLogPreview from "./WorkoutLogPreview";
import CalculatorPreview from "./CalculatorPreview";

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
            Sign in
          </Link>
          <Link to="/sign-up" className="btn primary-button">
            Sign up
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
        </div>
        <div className="panel">
          <WorkoutLogPreview />
        </div> */}
        <div className="panel panel--wide">
          <CalculatorPreview />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
