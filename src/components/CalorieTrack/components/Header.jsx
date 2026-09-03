import { useState } from "react";
import { Link } from "react-router";

// ============================================================
// Header.jsx
// Renders the page title/intro and the three "What is X?" definition
// buttons, plus the shared modal that displays whichever term was
// clicked. All three buttons open the *same* modal with different
// content — hence one shared modalState object rather than three
// separate open/closed booleans, which would risk two "modals" ending
// up open at once or getting out of sync with each other.
// ============================================================

const Header = () => {
  // Single source of truth for the definition modal: is it open,
  // and if so, which term's title/text should it show.
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    text: "",
  });

  /**
   * Opens the modal with a given term's title and definition text.
   * Called by each of the three "What is X?" buttons with their own content.
   */
  const openTermModal = (title, text) => {
    setModalState({ isOpen: true, title, text });
  };

  /**
   * Closes the modal and clears its content.
   */
  const closeTermModal = () => {
    setModalState({ isOpen: false, title: "", text: "" });
  };

  return (
    <>
      <header>
        <div className="return-container">
          <Link
            to="/dashboard"
            className="calculator-return-link"
            id="calculator-return"
          >
            Return to Dashboard
          </Link>
        </div>

        <div className="icon-container">
          <svg
            fill="currentColor"
            width="200px"
            height="200px"
            viewBox="0 0 15 15"
            id="fitness-centre"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              id="daec40ff-71f5-4432-9d75-dcba7b9c1b89"
              d="M14.5,7V8h-1v2h-1v1H11V8H4v3H2.5V10h-1V8H.5V7h1V5h1V4H4V7h7V4h1.5V5h1V7Z"
            />
          </svg>
          <svg
            width="200px"
            height="200px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 9H19M15 18V15M9 18H9.01M12 18H12.01M12 15H12.01M9 15H9.01M15 12H15.01M12 12H12.01M9 12H9.01M8.2 
                        21H15.8C16.9201 21 17.4802 21 17.908 20.782C18.2843 20.5903 18.5903 20.2843 18.782 19.908C19 19.4802 19 
                        18.9201 19 17.8V6.2C19 5.0799 19 4.51984 18.782 4.09202C18.5903 3.71569 18.2843 3.40973 17.908 3.21799C17.4802 
                        3 16.9201 3 15.8 3H8.2C7.0799 3 6.51984 3 6.09202 3.21799C5.71569 3.40973 5.40973 3.71569 5.21799 4.09202C5 4.51984 
                        5 5.07989 5 6.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 
                        7.07989 21 8.2 21Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </header>

      <div className="header-text">
        <h1>Fitness &amp; Expenditure Calculator</h1>
        <p>
          Calculate your BMI (Body Mass Index), BMR (Basal Metabolic Rate), and
          TDEE (Total Daily Energy Expenditure)
        </p>
      </div>

      <div className="definitions" id="terms" aria-label="Calculator terms">
        <button
          type="button"
          className="term-button"
          onClick={() =>
            openTermModal(
              "Body Mass Index (BMI)",
              `An estimation of body fat percentage based on an individual's height and weight.`,
            )
          }
        >
          What is BMI?
        </button>
        <button
          type="button"
          className="term-button"
          onClick={() =>
            openTermModal(
              "Basal Metabolic Rate (BMR)",
              `The base number of calories burned at rest to support basic life-sustaining functions (breathing, circulation, digestion, etc.).`,
            )
          }
        >
          What is BMR?
        </button>
        <button
          type="button"
          className="term-button"
          onClick={() =>
            openTermModal(
              "Total Daily Energy Expenditure (TDEE)",
              `The estimated total number of calories burned in a 24-hour period based on activity level.`,
            )
          }
        >
          What is TDEE?
        </button>
      </div>

      {modalState.isOpen && (
        // Clicking the overlay closes the modal; stopPropagation on the
        // inner panel prevents clicks inside it from bubbling up and
        // triggering that same close.
        <div className="modal-overlay" onClick={closeTermModal}>
          <div
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="term-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title" id="term-modal-title">
              {modalState.title}
            </h2>
            <div className="modal-divider" />
            <p className="modal-copy">{modalState.text}</p>
            <div className="modal-actions">
              <button className="close-button" onClick={closeTermModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
