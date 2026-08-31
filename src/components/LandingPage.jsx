import { Link } from "react-router";

const LandingPage = () => {
  return (
    <div className="landing">
      <nav className="landing__nav">
        <span className="landing__logo">Momentum</span>
        <div className="landing__nav-actions">
          <Link to="/sign-in" className="btn btn--ghost">
            Sign in
          </Link>
          <Link to="/sign-up" className="btn btn--primary">
            Sign up
          </Link>
        </div>
      </nav>

      {/* <Hero />

      <section className="landing__grid">
        <div className="panel panel--wide">
          <WorkoutFormPreview />
        </div>
        <div className="panel">
          <DashboardPreview />
        </div>
        <div className="panel">
          <WorkoutLogPreview />
        </div>
        <div className="panel panel--wide">
          <CalculatorPreview />
        </div>
      </section> */}
    </div>
  );
};

export default LandingPage;
