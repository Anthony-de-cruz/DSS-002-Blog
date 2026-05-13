import { query } from "../database.js";

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
        await query(
            `WITH new_payment_method AS (
                INSERT INTO payment_method (username, last_4_digits, expiry_year, expiry_month)
                VALUES ($1, $2, $3, $4)
                RETURNING payment_method_id
             ),
             new_transaction AS (
                INSERT INTO transactions (payment_method_id, amount)
                SELECT payment_method_id, $5
                FROM new_payment_method
                RETURNING transaction_id
             )
             SELECT new_payment_method.payment_method_id, new_transaction.transaction_id
             FROM new_payment_method, new_transaction;`,
            [username, last4Digits, expiryYear, expiryMonth, amount],
        );
    }
}
