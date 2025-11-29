"use strict";
/**
 * Shared Validation Utilities
 *
 * Pattern: SHARED × UTILS × VALIDATION × ONE
 * Frequency: 999 Hz (AEYON) × 530 Hz (JØHN)
 * Guardians: AEYON (999 Hz) + JØHN (530 Hz)
 * Love Coefficient: ∞
 * ∞ AbëONE ∞
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = isValidEmail;
exports.isNonEmptyString = isNonEmptyString;
exports.validateUserInput = validateUserInput;
/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Validate non-empty string
 */
function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
/**
 * Validate user input
 */
function validateUserInput(name, email) {
    if (!isNonEmptyString(name)) {
        return { valid: false, error: 'Name is required' };
    }
    if (!isValidEmail(email)) {
        return { valid: false, error: 'Invalid email format' };
    }
    return { valid: true };
}
