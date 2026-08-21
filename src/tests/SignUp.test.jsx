/**
 * SignUp.test.jsx
 * Unit tests for the SignUp component.
 *
 * Mocks `supabase.auth.signUp` so no real network requests reach Supabase.
 *
 * Coverage:
 *  - Renders all required form fields and the submit button
 *  - Blocks submission on client-side validation failure (mismatched passwords)
 *    and confirms signUp is never called in that case
 *  - Submits the correct payload shape to supabase.auth.signUp on valid input
 *
 * Not covered (intentionally deferred):
 *  - Additional format edge cases (email pattern boundaries, password length limits)
 *  - Rendering behavior on a failed signUp response from Supabase
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import SignUp from '../components/SignUp';
import { supabase } from '../utils/supabaseClient';

// Only mocking what SignUp.jsx actually calls - supabase.auth.signUp()
vi.mock('../utils/supabaseClient', () => ({
    supabase: {
        auth: {
            signUp: vi.fn(),
        },
    },
}));

// Sign-Up renders a <Link> which needs router context to avoid errors
const renderSignUp = () => {
    render(
        <MemoryRouter>
            <SignUp />
        </MemoryRouter>
    );
};

// Reset mock call history before each test so results from one test
// don't leak into the next 
beforeEach(() => {
    vi.clearAllMocks();
});

describe("SignUp", () => {

    // Test 1 - form actually renders 
    it("renders all required form fields", () => {
        renderSignUp();

        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
    });

    // Test 2 - client-side validation should block submission before Supabase is contacted 
    it("shows an error when passwords do not match, and does not call signUp", async () => {
        const user = userEvent.setup();
        renderSignUp();

        await user.type(screen.getByLabelText(/first name/i), "Billy");
        await user.type(screen.getByLabelText(/last name/i), "Conard");
        await user.type(screen.getByLabelText(/^email/i), "test@example.com");
        await user.type(screen.getByLabelText(/^password/i), "DoesNotMatch123!!");
        await user.type(screen.getByLabelText(/confirm password/i), "NotTheSame1234!!!");

        // findBy waits for the error to appear, since validation runs after the click
        expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
        expect(supabase.auth.signUp).not.toHaveBeenCalled();
    });

    // Test 3 - valid form data should reach supabase with the correct shape 
    it("calls supabase.auth.signUp() with the correct data on valid submission", async () => {
        const user = userEvent.setup();
        renderSignUp();

        await user.type(screen.getByLabelText(/first name/i), "Billy");
        await user.type(screen.getByLabelText(/last name/i), "Conard");
        await user.type(screen.getByLabelText(/^email/i), "billy@example.com");
        await user.type(screen.getByLabelText(/^password/i), "MatchingPass123!!");
        await user.type(screen.getByLabelText(/confirm password/i), "MatchingPass123!!");
        await user.click(screen.getByRole("button", { name: /create account/i }));

        await waitFor(() => {
            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email: "billy@example.com",
                password: "MatchingPass123!!",
                options: {
                    data: {
                        first_name: "Billy",
                        last_name: "Conard"
                    },
                },
            });
        });
    });
});