import pg from "pg";

/**
 * Static connection pool.
 */
const connectionPool = new pg.Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

/**
 * Query the database, and log it to console.
 *
 * @param {string} query - The SQL query.
 * @param {any[]} params - The query parameters.
 * @returns {Promise<pg.QueryArrayResult>} The database query result.
 * @throws {DuplicateEntryError} A unique constraint was violated.
 * @throws {ForeignKeyError} A foreign key constraint was violated.
 * @throws {NotNullError} A not-null constraint was violated.
 * @throws {CheckViolationError} A check constraint was violated.
 * @throws {DatabaseError} Any other database error.
 */
export async function query(query, params) {
    try {
        const start = Date.now();
        var res = await connectionPool.query(query, params);

        const duration = Date.now() - start;
        console.log("EXECUTED QUERY", {
            text: query,
            params,
            duration: duration + "ms",
            affectedRows: res.rowCount,
        });
        return res;
    } catch (err) {
        switch (err.code) {
            case "23505":
                throw new DuplicateEntryError("Unique constraint violated.", {
                    cause: err,
                });
            case "23503":
                throw new ForeignKeyError("Foreign key constraint violated.", {
                    cause: err,
                });
            case "23502":
                throw new NotNullError("Not-null constraint violated.", {
                    cause: err,
                });
            case "23514":
                throw new CheckViolationError("Check constraint violated.", {
                    cause: err,
                });
            default:
                console.error("Database query error:", err);
                throw new DatabaseError(
                    "An unexpected database error occurred.",
                    { cause: err },
                );
        }
    }
}

/**
 * Perform an empty query to test the database connection
 * @returns {Promise<boolean>} Whether the test was successful.
 * @throws {DatabaseError} Failed to query.
 */
export async function testConnection() {
    console.log("TEST QUERY EXECUTING");
    const result = await query("SELECT 1 AS res;");
    if (result.rowCount == 1 && result.rows[0].res == 1) {
        console.log("TEST QUERY SUCCESSFUL");
        return true;
    } else {
        console.error("TEST QUERY FAILED");
        console.error("Unexpected database response: ", result);
        return false;
    }
}

export class DatabaseError extends Error {
    constructor(msg, options) {
        super(msg, options);
        this.name = "DatabaseError";
    }
}

export class DuplicateEntryError extends DatabaseError {
    constructor(msg, options) {
        super(msg, options);
        this.name = "DuplicateEntryError";
    }
}

export class ForeignKeyError extends DatabaseError {
    constructor(msg, options) {
        super(msg, options);
        this.name = "ForeignKeyError";
    }
}

export class NotNullError extends DatabaseError {
    constructor(msg, options) {
        super(msg, options);
        this.name = "NotNullError";
    }
}

export class CheckViolationError extends DatabaseError {
    constructor(msg, options) {
        super(msg, options);
        this.name = "CheckViolationError";
    }
}
