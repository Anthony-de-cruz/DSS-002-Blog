const argon2 = require('argon2')

class Cryptography {
    /**
     * Returns bool
     */
    static async verifyPassword(hash, password) {
        return await argon2.verify(hash, password);
    }

    static async hashPassword(password) {
        return await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            hashLength: 50,
        });
    }
}
module.exports = User;
