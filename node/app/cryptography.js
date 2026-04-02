import {
    argon2,
    randomBytes,
    createCipheriv,
    createDecipheriv,
} from "node:crypto";

import { generateSecret, generate, verify, generateURI } from "otplib";
import { sign, verify } from "jsonwebtoken";

const passwordPepper = Buffer.from(process.env.PASSWORD_PEPPER, "hex");
const passwordHashingAlgo = "argon2id";

const totpEncryptionKey = Buffer.from(process.env.TOTP_ENCRYPTION_KEY, "hex");

const sessionPublicKey = Buffer.from(process.env.SESSION_PUB_KEY, "hex");
const sessionPrivateKey = Buffer.from(process.env.SESSION_PRI_KEY, "hex");
const sessionSigningAlgo = ["ES256"];

/**
 * Hash a plaintext password.
 *
 * @param {string} password - The password to be hashed.
 * @returns {Promise<Buffer>} A buffer containing the hashed password.
 * @throws {BadPasswordError} Invalid password.
 * @throws {CryptographyError} Hashing operation failed.
 */
export async function hashPassword(password) {
    if (password.length < 8) {
        throw new BadPasswordError("Password was below minimum length of 8.");
    }
    if (password.length > 64) {
        throw new BadPasswordError("Password exceeded maximum length of 64.");
    }

    try {
        const salt = randomBytes(16);
        const hash = await new Promise((resolve, reject) => {
            argon2(
                passwordHashingAlgo,
                {
                    message: password,
                    nonce: salt,
                    parallelism: 2,
                    tagLength: 32,
                    memory: 65536,
                    passes: 2,
                    secret: passwordPepper,
                },
                (err, derivedKey) => (err ? reject(err) : resolve(derivedKey)),
            );
        });
        return Buffer.concat([hash, salt]);
    } catch (err) {
        throw new CryptographyError(err);
    }
}

/**
 * Verify plaintext password.
 *
 * @param {string} password - The password to be compared.
 * @param {Buffer} passwordHash - The hashed password.
 * @returns {Promise<boolean>} Whether the password matches.
 * @throws {CryptographyError} Hashing operation failed.
 */
export async function verifyPassword(password, passwordHash) {
    if (passwordHash.length !== 48) {
        throw new CryptographyError();
    }
    const hash = passwordHash.subarray(0, 32); // first 32 bytes
    const salt = passwordHash.subarray(-16); // last 16 bytes

    try {
        const new_hash = await new Promise((resolve, reject) => {
            argon2(
                passwordHashingAlgo,
                {
                    message: password,
                    nonce: salt,
                    parallelism: 2,
                    tagLength: 32,
                    memory: 65536,
                    passes: 2,
                    secret: passwordPepper,
                },
                (err, derivedKey) => (err ? reject(err) : resolve(derivedKey)),
            );
        });
        return hash.equals(new_hash);
    } catch (err) {
        throw new CryptographyError(err);
    }
}

/**
 * Generate an encrypted TOTP secret.
 *
 * @returns {Promise<>} A buffer containing the encrypted secret.
 * @throws {CryptographyError} Encryption or generation operation failed.
 */
export async function generateTotpSecret() {
    let secret;
    try {
        secret = generateSecret();
    } catch (err) {
        throw new CryptographyError(err);
    }
    return encrypt(secret);
}

/**
 * Generate a TOTP code from the given secret.
 *
 * @param {Buffer} encryptedTotpSecret - The secret.
 * @returns {Promise<string>}A string containing the code.
 * @throws {InvalidTokenError} Cannot decrypt.
 * @throws {CryptographyError} Decryption or generation operation failed.
 */
async function generateTotpCode(encryptedTotpSecret) {
    const secret = decrypt(encryptedTotpSecret);
    try {
        return await generate({ secret: secret });
    } catch (err) {
        throw new CryptographyError(err);
    }
}

/**
 * Generate TOTP URI based on their credientials.
 *
 * @param {string} email - The user's label.
 * @param {Buffer} encryptedTotpSecret - The secret that will be decrypted.
 * @returns {Promise<string>} A string containing the URI.
 * @throws {InvalidTokenError} Cannot decrypt.
 * @throws {CryptographyError} Decryption or verification operation failed.
 */
export async function generateTotpUri(email, encryptedTotpSecret) {
    const secret = decrypt(encryptedTotpSecret);
    try {
        return generateURI({
            issuer: "CyberBlog",
            label: email,
            secret: secret,
        });
    } catch (err) {
        throw new CryptographyError(err);
    }
}

/**
 * Verify the given one time code against the encrypted secret.
 *
 * @param {string} code - The one time code to be tested against.
 * @param {Buffer} encryptedTotpSecret - The secret.
 * @returns {Promise<boolean>} Whether the code is valid.
 * @throws {InvalidTokenError} Cannot decrypt.
 * @throws {CryptographyError} Decryption or verification operation failed.
 */
export async function verifyTotpCode(code, encryptedTotpSecret) {
    const secret = decrypt(encryptedTotpSecret);
    try {
        const result = await verify({ secret: secret, token: code });
        return result.valid;
    } catch (err) {
        throw new CryptographyError(err);
    }
}

/**
 * Encrypt the given plaintext.
 *
 * @param {string} secret - The secret to be encrypted.
 * @returns {Buffer} Encrypted buffer.
 * @throws {CryptographyError} Decryption operation failed.
 */
function encrypt(secret) {
    try {
        const iv = randomBytes(12);
        const cipher = createCipheriv("aes-256-gcm", totpEncryptionKey, iv);
        const encryptedSecret = Buffer.concat([
            cipher.update(secret, "utf8"),
            cipher.final(),
        ]);
        return Buffer.concat([iv, encryptedSecret, cipher.getAuthTag()]);
    } catch (err) {
        throw new CryptographyError(err);
    }
}

/**
 * Decrypt the given buffer.
 *
 * @param {Buffer} encryptedSecret - The secret to be decrypted.
 * @returns {string} Decrypted plain text.
 * @throws {InvalidTokenError} Cannot decrypt.
 * @throws {CryptographyError} Decryption operation failed.
 */
function decrypt(encryptedSecret) {
    if (encryptedSecret.length !== 64) {
        throw new CryptographyError();
    }
    const iv = encryptedSecret.subarray(0, 12); // first 12 bytes
    const secret = encryptedSecret.subarray(12, -16); // middle bytes
    const authTag = encryptedSecret.subarray(-16); // last 16 bytes

    try {
        const decipher = createDecipheriv("aes-256-gcm", totpEncryptionKey, iv);
        decipher.setAuthTag(authTag);
        const decryptedSecret = Buffer.concat([
            decipher.update(secret, "utf8"),
            decipher.final(),
        ]);

        return decryptedSecret.toString();
    } catch (err) {
        throw new InvalidTokenError(err);
    }
}

/**
 *
 *
 * @param {string} username - The username to sign with.
 * @returns {string} The generated session token.
 * @throws {CryptographyError} Signing operation failed.
 */
export async function generateSessionToken(username) {
    try {
        return await new Promise((resolve, reject) => {
            sign(
                { username },
                sessionPrivateKey,
                { algorithms: sessionSigningAlgo, expiresIn: "1h" },
                (err, token) => (err ? reject(err) : resolve(token)),
            );
        });
    } catch (err) {
        throw new CryptographyError(err);
    }
}

/**
 *
 *
 * @param {} token -
 * @returns {}
 * @throws {InvalidTokenError} The token is invalid.
 */
export async function verifySessionToken(token) {
    try {
        return await new Promise((resolve, reject) => {
            verify(
                req.cookies.authToken,
                sessionPublicKey,
                { algorithms: sessionSigningAlgo },
                (err, decoded) => (err ? reject(err) : resolve(decoded)),
            );
        });
    } catch (err) {
        throw new InvalidTokenError(err);
    }
}

export class BadPasswordError extends Error {
    constructor() {
        super("Invalid password");
        this.name = "InvalidPasswordError";
    }
}

export class InvalidTokenError extends Error {
    constructor() {
        super("Invalid password");
        this.name = "InvalidPasswordError";
    }
}

export class CryptographyError extends Error {
    constructor(err) {
        super("Internal cryptography error", { cause: err });
        this.name = "CryptographyError";
    }
}
