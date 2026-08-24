import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitForm } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import WorkoutForm from '../components/WorkoutForm';
import { supabase } from '../utils/supabaseClient';

// Create spy/test objects for the chained methods 
const mockSelect = vi.fn();
const mockFrom = vi.fn(() => ({ select: mockSelect }));
const mockRpc = vi.fn();
const mockGetUser = vi.fn();


/**
 * Mock the entire supabase module for WorkoutForm
 * Supabase executes SELECT/FROM, rpc, and getUser()
*/ 
vi.mock('../utils/supabaseClient', () => ({
    createClient: () => ({
        from: mockFrom,
        rpc: mockRpc,
        auth: {
            getUser: mockGetUser,
        },
    }),
}));

// WorkoutForm renders a <Link> — router context to avoid errors 
const renderWorkoutForm = () => {
    render(
        <MemoryRouter>
            <WorkoutForm />
        </MemoryRouter>
    );
};

// beforeEach to reset the mock call 
beforeEach(() => {
    vi.clearAllMocks();
});

describe("WorkoutForm", () => {

        // Test 1 - WorkoutForm renders
        it ("renders workout form", () => {
            renderWorkoutForm();

            expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/type/i)).toBeInTheDocument();

        })

});