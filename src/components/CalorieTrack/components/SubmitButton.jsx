// ============================================================
// SubmitButton.jsx
// A genuinely "dumb" presentational component: it has no idea what
// validation or calculation logic exists, and no state of its own.
// It just renders a button and calls whatever function it was handed
// via the onSubmit prop. All of the actual submit logic lives in
// App.jsx's handleSubmit, which is passed down here.
// ============================================================
const SubmitButton = ({ onSubmit }) => {

    return ( 
        <>
        
            <div className="button_container">

                <button type="button" value="Submit" className="submit-button" onClick={onSubmit}>Submit</button>

            </div>
        
        </>
     );
}
 
export default SubmitButton;