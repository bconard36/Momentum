import { Link } from "react-router";

const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-cta">
        <h2>Ready to build some momentum?</h2>
        <p>Create an account and start logging your first workout today.</p>
        <Link to="/sign-up" className="footer-cta-button">
          Sign Up Free
        </Link>
      </div>

      <div className="footer-bottom">
        <span className="footer-logo">Momentum</span>
        <span className="footer-copyright">
          &copy; {new Date().getFullYear()} Momentum. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
