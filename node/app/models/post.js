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
     * Build and create a new post in the database.
     *
     * @param {string} username - The author's username.
     * @param {string} title - The post title.
     * @param {string} content - The post content.
     * @returns {Promise<Post>}
     * @throws {DatabaseError} Failed to perform database query.
     */
    static async buildNew(username, title, content) {
        const result = await query(
            `INSERT INTO post (username, title, content, timestamp)
             VALUES ($1, $2, $3, NOW())
             RETURNING post_id, timestamp`,
            [username, title, content],
        );
        return new Post(result.rows[0].post_id, username, title, content, result.rows[0].timestamp);
    }

    static async readAllFromDatabase() {
        const result = await query(
            `SELECT post_id, username, title, content, timestamp
         FROM post
         ORDER BY timestamp DESC;`,
            [],
        );

        return result.rows.map(
            (postData) =>
                new Post(
                    postData.post_id,
                    postData.username,
                    postData.title,
                    postData.content,
                    postData.timestamp,
                ),
        );
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
        const result = await query("SELECT * FROM post WHERE post_id = $1;", [id]);
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
     * Update the title in the database.
     *
     * @param {string} newTitle - The new title to set.
     * @returns {Promise<void>}
     * @throws {DatabaseError} Failed to perform database query.
     */
    async updateTitle(newTitle) {
        await query("UPDATE post SET title = $1 WHERE post_id = $2", [newTitle, this.id]);
        this.title = newTitle;
    }

    /**
     * Update the content in the database.
     *
     * @param {string} newContent - The new content to set.
     * @returns {Promise<void>}
     * @throws {DatabaseError} Failed to perform database query.
     */
    async updateContent(newContent) {
        await query("UPDATE post SET content = $1 WHERE post_id = $2", [newContent, this.id]);
        this.content = newContent;
    }

    /**
     * Update a post when it belongs to the given user or the user is an admin.
     *
     * @param {number} id - The post id to update.
     * @param {string} username - The current user's username.
     * @param {boolean} admin - Whether the current user is an admin.
     * @param {string} title - The new post title.
     * @param {string} content - The new post content.
     * @returns {Promise<Post|null>}
     * @throws {DatabaseError} Failed to perform database query.
     */
    static async updateByAuthorizedUser(id, username, admin, title, content) {
        const result = await query(
            `UPDATE post
             SET title = $1, content = $2
             WHERE post_id = $3 AND (username = $4 OR $5 = TRUE)
             RETURNING post_id, username, title, content, timestamp;`,
            [title, content, id, username, admin],
        );

        if (result.rowCount !== 1) {
            return null;
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
     * Delete a post from the database by id.
     *
     * @param {number} id - The post id to delete.
     * @returns {Promise<void>}
     * @throws {DatabaseError} Failed to perform database query.
     */
    static async delete(id) {
        await query("DELETE FROM post WHERE post_id = $1", [id]);
    }

    /**
     * Delete a post when it belongs to the given user or the user is an admin.
     *
     * @param {number} id - The post id to delete.
     * @param {string} username - The current user's username.
     * @param {boolean} admin - Whether the current user is an admin.
     * @returns {Promise<boolean>}
     * @throws {DatabaseError} Failed to perform database query.
     */
    static async deleteByAuthorizedUser(id, username, admin) {
        const result = await query(
            "DELETE FROM post WHERE post_id = $1 AND (username = $2 OR $3 = TRUE)",
            [id, username, admin],
        );
        return result.rowCount === 1;
    }
}
