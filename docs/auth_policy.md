# Authentication Policy

The system authentication policy will be roughly aligned with [OWASP Guidelines](https://cheatsheetseries.owasp.org/).
[Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
[Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

All users will be required to use password + Time-based One Time Passwords (TOTP).

### Password Requirements
- Minimum length of 8 characters.
- Maximum length of 64 characters.
- Screened against a blacklist.
- Hashed via argon2id configured for 19 MiB of memory, an iteration count of 2, and 1 degree of parallelism. -> [node-argon2](https://www.npmjs.com/package//argon2)
- Salted with 16 random bytes.
- Peppered with 16 random bytes.
- Rotatable. - INVESTIGATE FURTHER
- Show a password strength meter. - INVESTIGATE FURTHER

