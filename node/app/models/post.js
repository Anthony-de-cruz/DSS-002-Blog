import { DatabaseError, query } from "../database.js";

/**
 * Represents a blog post.
 */
export class Post {
    /**
     * @param {number} id
     * @param {string} username
     * @param {string} title
     * @param {string} content
     * @param {Date} timestamp 
     */
    constructor(id, username, title, content, timestamp) {
        this.id = id;
        this.username = username;
        this.title = title;
        this.content = content;
        this.timestamp = timestamp;
    }

    /**
     * Build an instance from a prexisting DB record.
     *
     * @param {number} id - The id by which to read.
     * @returns {Promise<Post>}
     * @throws {Error} Failed to find id.
     * @throws {DatabaseError} Failed to perform database query.
     */
    static async readFromDb(id) {
        const result = await query(
            "SELECT * FROM post WHERE post_id = $1;",
            [id],
        );
        if (result.rowCount != 1) {
            throw new Error(`Post "${id}" not found in DB.`);
        }

        const postData = result.rows[0];
        return new Post(
            postData.post_id,
            postData.username,
            postData.title,
            postData.content,
            postData.timestamp,
        );
    }

    /**
     * Build an instance from a prexisting DB record.
     *
     * @returns {Promise<void>}
     * @throws {DatabaseError} Failed to perform database query.
     */
    async writeToDb() {
        await query(
            `INSERT INTO post (post_id, username, title, content, timestamp)
        VALUES ($1, $2, $3, $4, $5)`,
            [
                this.id,
                this.username,
                this.title,
                this.content,
                this.timestamp,
            ],
        );
    }
}
