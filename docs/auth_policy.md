# Authentication Policy

The system authentication policy will be roughly aligned with [OWASP Guidelines](https://cheatsheetseries.owasp.org/).
[Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
[Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

All users will be required to use password + Time-based One Time Passwords (TOTP).

### Password Requirements

- Minimum length of 8 characters.
- Maximum length of 64 characters.
- Screened against a blacklist. - TODO
- Hashed via argon2id configured for 64 MiB of memory, an iteration count of 2, and 2 degrees of parallelism.
- Salted with 16 random bytes.
- Peppered with the server-side PASSWORD_PEPPER environment variable.
- Rotatable. - INVESTIGATE FURTHER
- Show a password strength meter. - INVESTIGATE FURTHER

### TOTP Requirements

- Required for all accounts.
- Encrypted at rest via AES-256-GCM
- Setup page must show both the QR code and raw otpauth URI.
- Submitted TOTP codes must be exactly 6 numeric digits.

### Session Requirements

- Session tokens are signed with ES256.
- Cookies must be HttpOnly, Secure, SameSite=Strict, and scoped to `/`.
- Login uses a short pre-MFA session before creating a full authenticated session.
- Account edits require a reauthenticated/elevated session.
