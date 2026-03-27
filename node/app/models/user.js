import { generateURI } from "otplib";

import Database from "../database.js";
import Cryptography from "../cryptography.js";

/**
 *
 *
 *
 */
class User {
    /**
     * @param {string} username
     * @param {buffer} password_hash
     */
    constructor(
        username,
        password_hash,
        totp_secret,
        email,
        premium,
    ) {
        this.username = username;
        this.password_hash = password_hash;
        this.totp_secret = totp_secret;
        this.email = email;
        this.premium = premium;
    }

    /**
     * Generate
     *
     */
    static async buildNew(username, password, email) {
        return new User(
            username,
            await Cryptography.hashPassword(password),
            await Cryptography.generateTotpSecret(),
            email,
            false,
        );
    }

    /**
     * Build an instance from a prexisting DB record
     *
     * @throws If user is not found for query fails.
     * @returns
     */
    static async readFromDatabase(username) {
        const result = await Database.query(
            "SELECT * FROM end_user WHERE username = $1;",
            [username],
        );
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
     * Build an instance from a prexisting DB record
     *
     * @throws
     * @returns
     */
    async writeToDatabase() {
        await Database.query(
            `INSERT INTO end_user (username, password_hash, totp_secret, email, premium)
        VALUES ($1, $2, $3, $4, $5)`,
            [
                this.username,
                this.password_hash,
                this.totp_secret,
                this.email,
                this.premium,
            ],
        );
    }

    /**
     * Generate TOTP URI based on their credientials.
     */
    generateTotpUri() {
        return generateURI({
          issuer: "CyberBlog",
          label: this.email,
          secret: this.totp_secret,
        });
    }
}

export default User;
