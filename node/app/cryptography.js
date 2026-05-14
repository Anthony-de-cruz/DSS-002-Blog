import { argon2, randomBytes, createCipheriv, createDecipheriv } from "node:crypto";

import { generateSecret, generate, verify as verifyOtp, generateURI } from "otplib";
import jwt from "jsonwebtoken";

if (
    !process.env.PASSWORD_PEPPER ||
    !process.env.TOTP_ENCRYPTION_KEY ||
    !process.env.PAYMENT_ENCRYPTION_KEY ||
    !process.env.SESSION_PUB_KEY ||
    !process.env.SESSION_PRI_KEY
)
    throw new Error(
        "PASSWORD_PEPPER, TOTP_ENCRYPTION_KEY, PAYMENT_ENCRYPTION_KEY, SESSION_PUB_KEY, SESSION_PRI_KEY environment variables are required",
    );

const passwordPepper = Buffer.from(process.env.PASSWORD_PEPPER, "hex");
const passwordHashingAlgo = "argon2id";

const totpEncryptionKey = readEncryptionKey(process.env.TOTP_ENCRYPTION_KEY, "TOTP_ENCRYPTION_KEY");
const paymentEncryptionKey = readEncryptionKey(
    process.env.PAYMENT_ENCRYPTION_KEY,
    "PAYMENT_ENCRYPTION_KEY",
);

const sessionPublicKey = process.env.SESSION_PUB_KEY;
const sessionPrivateKey = process.env.SESSION_PRI_KEY;
const sessionSigningAlgo = "ES256";

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

        // Real production environment should include
        // hashing methodology version number in the header.
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
    return encrypt(secret, totpEncryptionKey);
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
    const secret = decrypt(encryptedTotpSecret, totpEncryptionKey);
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
    const secret = decrypt(encryptedTotpSecret, totpEncryptionKey);
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
 * @throws {CryptographyError} Decryption or verification operation failed.
 */
export async function verifyTotpCode(code, encryptedTotpSecret) {
    const secret = decrypt(encryptedTotpSecret, totpEncryptionKey);
    try {
        const result = await verifyOtp({ secret: secret, token: code });
        return result.valid;
    } catch (err) {
        throw new CryptographyError(err);
    }
}

/**
 * Encrypt the card details that are safe to keep after validation.
 *
 * The full card number and security code should not be passed here.
 *
 * @param {string} last4Digits - The final four card digits.
 * @param {number} expiryYear - Four digit expiry year.
 * @param {number} expiryMonth - Expiry month from 1 to 12.
 * @returns {Buffer} Encrypted payment details.
 * @throws {CryptographyError} Encryption operation failed.
 */
export function encryptPaymentDetails(last4Digits, expiryYear, expiryMonth) {
    return encrypt(
        JSON.stringify({
            last4Digits,
            expiryYear,
            expiryMonth,
        }),
        paymentEncryptionKey,
    );
}

/**
 * Decrypt stored payment details.
 *
 * @param {Buffer} encryptedPaymentDetails - The encrypted payment details.
 * @returns {{last4Digits: string, expiryYear: number, expiryMonth: number}} Decrypted payment details.
 * @throws {InvalidTokenError} Cannot decrypt.
 * @throws {CryptographyError} Decryption operation failed.
 */
export function decryptPaymentDetails(encryptedPaymentDetails) {
    const decryptedDetails = decrypt(encryptedPaymentDetails, paymentEncryptionKey);
    try {
        return JSON.parse(decryptedDetails);
    } catch (err) {
        throw new CryptographyError(err);
    }
}

/**
 * Encrypt the given plaintext.
 *
 * @param {string} secret - The secret to be encrypted.
 * @returns {Buffer} Encrypted buffer.
 * @throws {CryptographyError} Ecryption operation failed.
 */
function encrypt(secret, encryptionKey) {
    try {
        const iv = randomBytes(12);
        const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);
        const encryptedSecret = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
        const authTag = cipher.getAuthTag();

        // Real production environment should include
        // encryption methodology version number in the header.
        const header = Buffer.alloc(12); // Allocate 3 x 4 bytes for header.
        header.writeUInt32BE(iv.length, 0);
        header.writeUInt32BE(encryptedSecret.length, 4);
        header.writeUInt32BE(authTag.length, 8);
        return Buffer.concat([header, iv, encryptedSecret, authTag]);
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
function decrypt(encryptedSecret, encryptionKey) {
    // Parse buffer header.
    const headerLength = 12;
    if (encryptedSecret.length < headerLength) {
        throw new CryptographyError("Invalid buffer length");
    }

    const ivLength = encryptedSecret.readUInt32BE(0);
    const cipherLength = encryptedSecret.readUInt32BE(4);
    const tagLength = encryptedSecret.readUInt32BE(8);
    const expectedLength = headerLength + ivLength + cipherLength + tagLength;

    if (encryptedSecret.length !== expectedLength) {
        throw new CryptographyError("Invalid buffer length");
    }

    // Parse buffer body.
    let offset = headerLength;
    const iv = encryptedSecret.subarray(offset, offset + ivLength);
    offset += ivLength;
    const cipher = encryptedSecret.subarray(offset, offset + cipherLength);
    offset += cipherLength;
    const authTag = encryptedSecret.subarray(offset, offset + tagLength);

    // Decrypt.
    try {
        const decipher = createDecipheriv("aes-256-gcm", encryptionKey, iv);
        decipher.setAuthTag(authTag);
        const decryptedSecret = Buffer.concat([decipher.update(cipher), decipher.final()]);
        return decryptedSecret.toString();
    } catch (err) {
        throw new InvalidTokenError(err);
    }
}

function readEncryptionKey(value, name) {
    const key = Buffer.from(value, "hex");
    if (key.length !== 32) {
        throw new Error(`${name} must be a 32 byte hex value for AES-256-GCM`);
    }

    return key;
}

/**
 * Generate a signed session token.
 *
 * @param {string} payload - The payload to sign.
 * @param {number} expiresIn - The time to expiry.
 * @returns {Promise<string>} The generated session token.
 * @throws {CryptographyError} Signing operation failed.
 */
export async function generateSessionToken(payload, expiresIn) {
    try {
        return await new Promise((resolve, reject) => {
            jwt.sign(
                payload,
                sessionPrivateKey,
                { algorithm: sessionSigningAlgo, expiresIn: expiresIn },
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
 * @param {string} token - The session token.
 * @returns {Promise<string>} The decoded payload.
 * @throws {CryptographyError} Signing operation failed.
 */
export async function decodeSessionToken(token) {
    try {
        return await new Promise((resolve, reject) => {
            jwt.verify(
                token,
                sessionPublicKey,
                { algorithms: [sessionSigningAlgo] },
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
