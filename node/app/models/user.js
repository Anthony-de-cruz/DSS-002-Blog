import { DatabaseError, query } from "../database.js";
import { hashPassword, generateTotpSecret } from "../cryptography.js";

/**
 * Represents a system user.
 */
export class User {
    /**
     * @param {string} username
     * @param {Buffer} passwordHash
     * @param {Buffer} totpSecret
     * @param {string} email
     * @param {boolean} premium
     */
    constructor(username, passwordHash, totpSecret, email, premium) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.totpSecret = totpSecret;
        this.email = email;
        this.premium = premium;
    }

    /**
     * Generate
     *
     * @param {string} username -
     * @param {string} password -
     * @param {string} email -
     * @returns
     * @throws
     */
    static async buildNew(username, password, email) {
        return new User(
            username,
            await hashPassword(password),
            await generateTotpSecret(),
            email,
            false,
        );
    }

    /**
     * Build an instance from a prexisting DB record.
     *
     * @param {string} username - The username by which to read.
     * @returns {Promise<User>}
     * @throws {Error} Failed to find username.
     * @throws {DatabaseError} Failed to perform database query.
     */
    static async readFromDatabase(username) {
        const result = await query("SELECT * FROM end_user WHERE username = $1;", [username]);
        if (result.rowCount != 1) {
            throw new Error(`User "${username}" not found in DB.`);
        }

        const userData = result.rows[0];
        return new User(
            userData.username,
            userData.password_hash,
            userData.totp_secret,
            userData.email,
            userData.premium,
        );
    }

    /**
     * Build an instance from a prexisting DB record.
     *
     * @returns {Promise<void>}
     * @throws
     */
    async writeToDatabase() {
        await query(
            `INSERT INTO end_user (username, password_hash, totp_secret, email, premium)
        VALUES ($1, $2, $3, $4, $5)`,
            [this.username, this.passwordHash, this.totpSecret, this.email, this.premium],
        );
    }

    /**
     * Update the username in the database.
     *
     * @param {string} newUsername - The new username to set.
     * @returns {Promise<void>}
     * @throws {DatabaseError} Failed to perform database query.
     */
    async updateUsername(newUsername) {
        await query("UPDATE end_user SET username = $1 WHERE username = $2", [
            newUsername,
            this.username,
        ]);
        this.username = newUsername;
    }

    /**
     * Update the password in the database.
     *
     * @param {string} newPassword - The new password to hash and store.
     * @returns {Promise<void>}
     * @throws {DatabaseError} Failed to perform database query.
     */
    async updatePassword(newPassword) {
        const newPasswordHash = await hashPassword(newPassword);
        await query("UPDATE end_user SET password_hash = $1 WHERE username = $2", [
            newPasswordHash,
            this.username,
        ]);
        this.passwordHash = newPasswordHash;
    }

    /**
     * Update the email in the database.
     *
     * @param {string} newEmail - The new email to set.
     * @returns {Promise<void>}
     * @throws {DatabaseError} Failed to perform database query.
     */
    async updateEmail(newEmail) {
        await query("UPDATE end_user SET email = $1 WHERE username = $2", [
            newEmail,
            this.username,
        ]);
        this.email = newEmail;
    }
 async updateEmail(newEmail) {
    await query("UPDATE end_user SET email = $1 WHERE username = $2", [
        newEmail,
        this.username,
    ]);
    this.email = newEmail;
}

async upgradeToPremium() {
    await query("UPDATE end_user SET premium = TRUE WHERE username = $1;", [
        this.username,
    ]);
    this.premium = true;
}
}
