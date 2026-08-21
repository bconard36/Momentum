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
    })

});