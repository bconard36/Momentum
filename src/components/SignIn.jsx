/**
 * Sign In component constructor 
 * Holds Email and Password inputs for account sign in
 * @returns Sign in component 
 */
const SignIn = () => {
    return ( 
        <>
            <div className="sign-in-container">
                <div className="sign-in-form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="text" id="email" name="email"></input>
                </div>
                <div className="sign-in-form-group">
                    <label htmlFor="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password"
                        autoComplete="current-password" 
                    />
                </div>
            </div>
        </>
     );
}
 
export default SignIn;