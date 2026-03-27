import pg from "pg";

/**
 * Class for database interop.
 */
class Database {
    /**
     * Static connection pool for simplicity.
     */
    static connectionPool = new pg.Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    /**
     * Query the database, and log it to console
     *
     * @returns The database query result as a pg.QueryArrayResult<any[]>
     * @throws When an invalid query is passed
     */
    static async query(text, params) {
        console.log(text, params);
        try {
            const start = Date.now();
            var res = await Database.connectionPool.query(text, params);

            const duration = Date.now() - start;
            console.log("executed query", {
                text,
                params,
                duration,
                rows: res.rowCount,
            });
            return res;
        } catch (err) {
            // Duplicate error code
            if (err.code === "23505") {
                console.error("Duplicate key error:", err.detail);
                throw new Error("Duplicate entry detected");
            } else {
                console.error("Database query error:", err);
                throw err;
            }
        }
    }

    /**
     * Perform an empty query to test the database connection
     * @returns Test success boolean
     */
    static async testConnection() {
        console.log("EXECUTING TEST QUERY");
        const result = await Database.query("SELECT 1 AS res;");
        if (result.rowCount == 1 && result.rows[0].res == 1) {
            console.log("TEST QUERY SUCCESSFUL");
            return true;
        } else {
            console.error("Unexpected database response: ", result);
            return false;
        }
    }
}

export default Database;
