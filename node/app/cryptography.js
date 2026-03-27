import {
    argon2,
    randomBytes,
    createCipheriv,
    createDecipheriv,
} from "node:crypto";

import {
    generateSecret,
    generate,
    verify,
    generateURI
} from "otplib";

/**
 * Class for cryptography.
 */
class Cryptography {
    /**
     * Verify plaintext password.
     *
     * @param {string} password
     * @param {Buffer} hash
     * @param {Buffer} salt
     * @returns
     * @throws
     */
    static verifyPassword(password, passwordHash) {
        const hash = passwordHash.slice(0, 32); // first 32 bytes
        const salt = passwordHash.slice(-16); // last 16 bytes

        const new_hash = argon2Sync("argon2id", {
            message: password,
            nonce: salt,
            parallelism: 2,
            tagLength: 32,
            memory: 65536,
            passes: 2,
            secret: process.env.PASSWORD_PEPPER,
        });
        return hash.equals(new_hash);
    }

    /**
     *
     * @param {string} password
     * @returns
     */
    static async hashPassword(password) {
        if (password.length < 8) {
            throw new Error("Password too short.");
        }
        if (password.length > 64) {
            throw new Error("Password too long.");
        }

        const salt = randomBytes(16);
        const hash = await new Promise((resolve, reject) => {
            argon2(
                "argon2id",
                {
                    message: password,
                    nonce: salt,
                    parallelism: 2,
                    tagLength: 32,
                    memory: 65536,
                    passes: 2,
                    secret: process.env.PASSWORD_PEPPER,
                },
                (err, derivedKey) => {
                    if (err) reject(err);
                    else resolve(derivedKey);
                },
            );
        });

        return Buffer.concat([
            hash,
            salt
        ]);
    }

    /*
     * Generate an encrypted TOTP secret.
     *
     * @returns A buffer containing the encrypted secret.
     */
    static async generateTotpSecret() {
        return Cryptography.encrypt(generateSecret())
    }

    static async generateTotpCode(encryptedTotpSecret) {
        const secret = Cryptography.decrypt(encryptedTotpSecret);

        return await generate({secret: secret})
    }

    static async generateTotpUri(encryptedTotpSecret) {
        const secret = Cryptography.decrypt(encryptedTotpSecret);

    }

    /*
     * Verify the given
     *
     * @param {string}
     * @param {Buffer}
     * @returns
     * @throws 
     *
     */
    static async verifyTotpCode(code, encryptedTotpSecret) {
        const secret = Cryptography.decrypt(encryptedTotpSecret);

        const result = await verify({ secret: secret, token: code });
        return result.valid;
    }

    
    /*
     * Encrypt the given plaintext.
     *
     * @param {}
     * @returns Encrypted buffer.
     */
    static encrypt(secret) {
        const key = Buffer.from(process.env.TOTP_ENCRYPTION_KEY, 'hex');
        const iv = randomBytes(12);

        const cipher = createCipheriv("aes-256-gcm", key, iv);
        const encryptedSecret = Buffer.concat([
            cipher.update(secret, "utf8"),
            cipher.final()
        ]);
        return Buffer.concat([iv, encryptedSecret, cipher.getAuthTag()]);
    }

    /*
     * Decrypt the given buffer.
     *
     * @param {Buffer} encryptedSecret 
     * @returns Decrypted plain text.
     */
    static decrypt(encryptedSecret) {
        const key = Buffer.from(process.env.TOTP_ENCRYPTION_KEY, 'hex');
        const iv = encryptedSecret.slice(0, 12); // first 12 bytes
        const secret = encryptedSecret.slice(12, -16); // middle bytes
        const authTag = encryptedSecret.slice(-16); // last 16 bytes

        // Decrypt.
        const decipher = createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        const decryptedSecret = Buffer.concat([
            decipher.update(secret, 'utf8'),
            decipher.final()
        ]);

        return decryptedSecret.toString();
    }
}

export default Cryptography;
