/**
 * 
 * 
 * @param {} fields
 * @param {function(int):void} failure
 * @returns 
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
 * 
 * 
 * @param {string} field 
 * @param {function(int):void} failure
 * @returns 
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
 * 
 * 
 * @param {*} field 
 * @param {*} maxLength 
 * @param {*} failure 
 * @returns 
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
 * 
 * 
 * @param {*} field 
 * @param {*} pattern 
 * @param {*} failure 
 * @returns 
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
