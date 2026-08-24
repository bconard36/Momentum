import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import EditWorkout from '../components/EditWorkout';

// Create spy/test objects for the chained methods
// These will be used to mock the behaviour/functions of EditWorkout
const { mockFetchWorkoutLog, 
        mockWorkout,
        mockIsEditing,
        mockSuccess,
        mockSelect, 
        mockFrom, 
        mockUpdate, 
        mockInsert, 
        mockRpc, 
        mockGetUser, 
        mockDelete } = vi.hoisted(() => ({
            mockFetchWorkoutLog: vi.fn(),
            mockSelect: vi.fn(),
            mockFrom: vi.fn(),
            mockUpdate: vi.fn(),
            mockInsert: vi.fn(),
            mockRpc: vi.fn(),
            // mockGetUser: vi.fn(), Does this get the user? Or simply compare a value of auth.uid() in the DB?
            mockDelete: vi.fn(),
        }));

/**
 * Mock the entire supabase module from EditWorkout
 * Supabase executes SELECT/FROM, UPDATE, INSERT, DELETE
 */
vi.mock('../utils/supabaseClient', () => ({
    supabase: {
        from: mockFrom,
        rpc: mockRpc
    }
}));

const renderEditWorkout = () => {
    render(
        <EditWorkout />
    );
}

/**
 * Reset mockCall history before each test
 * Also reset mock return and resolve values? 
 */
beforeEach(() => {
    vi.clearAllMocks();
});

