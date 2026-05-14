import { query } from "../database.js";
import { encryptPaymentDetails } from "../cryptography.js";

/**
 * Represents a recorded premium donation.
 */
export class Payment {
    /**
     * Store a payment method summary and transaction record.
     *
     * The full card number and security code are intentionally not stored.
     *
     * @param {string} username
     * @param {string} last4Digits
     * @param {number} expiryYear
     * @param {number} expiryMonth
     * @param {number} amount
     * @returns {Promise<void>}
     * @throws {DatabaseError} Failed to perform database query.
     */
    static async recordDonation(username, last4Digits, expiryYear, expiryMonth, amount) {
        const encryptedPaymentDetails = encryptPaymentDetails(last4Digits, expiryYear, expiryMonth);

        await query(
            `WITH new_payment_method AS (
                INSERT INTO payment_method (username, encrypted_payment_details)
                VALUES ($1, $2)
                RETURNING payment_method_id
             ),
             new_transaction AS (
                INSERT INTO transactions (payment_method_id, amount)
                SELECT payment_method_id, $3
                FROM new_payment_method
                RETURNING transaction_id
             )
             SELECT new_payment_method.payment_method_id, new_transaction.transaction_id
             FROM new_payment_method, new_transaction;`,
            [username, encryptedPaymentDetails, amount],
        );
    }
}
