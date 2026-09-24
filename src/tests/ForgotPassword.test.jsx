/**
 * ForgotPassword.test.jsx
 * Integration tests for the ForgotPassword component.
 *
 *
 * Coverage:
 *
 *
 * Not covered (intentionally deferred):
 *
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import AccountSettings from "../components/AccountSettings";
