import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password for storage on `users.passwordHash`.
 * @param {string} password
 * @returns {Promise<string>}
 */
export function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plaintext password against a stored bcrypt hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
