import { Link } from "react-router";


const NotFound = () => {
    return ( 
        <>
            <div className="not-found-container">
                <p className="not-found-text">Sorry, dead end.</p>
                <Link to="/dashboard" className="not-found-link">Build Momentum Here</Link>
            </div>
        </>
     );
}
 
export default NotFound;