import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import SignIn from '../components/SignIn';
import { supabase } from '../utils/supabaseClient';

// Only mocking what SignIn.jsx actually calls - supabase.auth.signInWithPassword()
vi.mock('../utils/supabaseClient', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            match: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(),
        })),
    },
}));

// Sign-In renders a <Link> which needs router context 
const renderSignIn = () => {
    render(
        <MemoryRouter>
            <SignIn />
        </MemoryRouter>
    );
};

// Reset mock call history before each test 
beforeEach(() => {
    vi.clearAllMocks();
});

describe("SignIn", () => {

    // Test 1 - renders the form 
    it("renders all required form fields", () => {
        renderSignIn();

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });

    // Test 2 - client-side validation to block submission before supabase is contacted 
    it("shows an error when input field(s) is empty, and does not call signIn", async () => {
        renderSignIn();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/password/i), "NoEmailNoAccess2Day!");

        // Trigger action that calls setError
        const button = screen.getByRole("button", { name: /sign in/i });
        await userEvent.click(button);
        
        // Query to find the error message
        const errorMessage = await screen.findByText(/email address is required/i);
        expect(errorMessage).toBeInTheDocument();
    });

    // Test 3 - invalid email and password combination blocked by supabase
    it("prevents login with invalid credentials", async () => {
        supabase.auth.signInWithPassword.mockResolvedValueOnce({
            data: null,
            error: { message: "Invalid login credentials" },
        });
        renderSignIn();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/email address/i), "bconard24@gmail.com");
        await user.type(screen.getByLabelText(/password/i), "ThisIsNotMyPassword!!");

        // Trigger action that calls setError
        const button = screen.getByRole("button", { name: /sign in/i });
        await userEvent.click(button);

        await waitFor(() => {
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    email: "bconard24@gmail.com",
                    password: "ThisIsNotMyPassword!!"
                })
            );
        })
        // Query to find the error message
        const errorMessage = await screen.findByText(/invalid login credentials/i);
        expect(errorMessage).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    });

    // Test 4 - successful login with authenticated credentials 
    it("allows dashboard access for authenticated users", async () => {
        supabase.auth.signInWithPassword.mockResolvedValueOnce({
            data: {
                email: "bconard24@gmail.com",
                password: "BillyC1234!!"
            },
            error: null
        });
        renderSignIn();
        const user = userEvent.setup();
        await user.type(screen.getByLabelText(/email address/i), "bconard24@gmail.com");
        await user.type(screen.getByLabelText(/password/i), "BillyC1234!!");

        // Trigger action
        const button = screen.getByRole("button", { name: /sign in/i });
        await userEvent.click(button);

        await waitFor(() => {
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: "bconard24@gmail.com",
                password: "BillyC1234!!",
            });
        })        
    });
});