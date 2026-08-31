import { Link } from "react-router";
import WorkoutFormPreview from "./WorkoutFormPreview";

const LandingPage = () => {
  return (
    <div className="landing">
      <nav className="landing-nav">
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

      {/* <Hero /> */}

      <section className="landing-grid">
        <div className="panel panel-wide">
          <WorkoutFormPreview />
        </div>
        {/* <div className="panel">
          <DashboardPreview />
        </div>
        <div className="panel">
          <WorkoutLogPreview />
        </div>
        <div className="panel panel--wide">
          <CalculatorPreview />
        </div> */}
      </section>
    </div>
  );
};

export default LandingPage;
