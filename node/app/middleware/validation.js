/**
 * Create middleware that checks a form has all required fields filled in.
 *
 * @param {string[]} fields - Field names that must exist in the submitted form.
 * @param {function} failure - Function that sends the user to the error response.
 * @returns {function} Express middleware that validates required form fields.
 */
export function requireFields(fields, failure) {
    return function (req, res, next) {
        for (const field of fields) {
            // Treat missing, non-string, and blank values as invalid form input.
            if (typeof req.body[field] !== "string" || req.body[field].trim().length === 0) {
                return failure(req, res);
            }

            req.body[field] = req.body[field].trim();
        }

        return next();
    };
}

/**
 * Create middleware that checks a TOTP/MFA code is exactly six digits.
 *
 * @param {string} field - Name of the form field containing the TOTP code.
 * @param {function} failure - Function that sends the user to the error response.
 * @returns {function} Express middleware that validates the TOTP field.
 */
export function requireTotp(field, failure) {
    return function (req, res, next) {
        const value = req.body[field];

        // TOTP codes are exactly 6 numeric digits.
        if (typeof value !== "string" || !/^[0-9]{6}$/.test(value.trim())) {
            return failure(req, res);
        }

        req.body[field] = value.trim();
        return next();
    };
}

/**
 * Create middleware that rejects a form field when it is too long.
 *
 * @param {string} field - Name of the form field to check.
 * @param {number} maxLength - Maximum allowed number of characters.
 * @param {function} failure - Function that sends the user to the error response.
 * @returns {function} Express middleware that checks field length.
 */
export function requireMaxLength(field, maxLength, failure) {
    return function (req, res, next) {
        // Reject oversized values before they reach the database layer.
        if (typeof req.body[field] !== "string" || req.body[field].length > maxLength) {
            return failure(req, res);
        }

        return next();
    };
}

/**
 * Create middleware that checks a form field matches a regular expression.
 *
 * @param {string} field - Name of the form field to check.
 * @param {RegExp} pattern - Regular expression the field must match.
 * @param {function} failure - Function that sends the user to the error response.
 * @returns {function} Express middleware that validates the field format.
 */
export function requirePattern(field, pattern, failure) {
    return function (req, res, next) {
        // Keep simple format checks close to the route.
        if (typeof req.body[field] !== "string" || !pattern.test(req.body[field])) {
            return failure(req, res);
        }

        return next();
    };
}
