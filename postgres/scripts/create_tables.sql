-- !psql

CREATE TABLE IF NOT EXISTS end_user (
    username VARCHAR(20)           NOT NULL,
    password VARCHAR(20)           NOT NULL CHECK (LENGTH(password) >= 8),
    email    VARCHAR(30)           NOT NULL,
    premium  BOOLEAN DEFAULT FALSE NOT NULL,
    PRIMARY KEY (username)
);

CREATE TABLE IF NOT EXISTS blacklisted_passwords
(
    password VARCHAR(20) NOT NULL CHECK (LENGTH(password) >= 8),
    PRIMARY KEY (password)
);

CREATE TABLE IF NOT EXISTS payment_method (
    payment_method_id SERIAL,
    username          VARCHAR(20) NOT NULL,
    last_4_digits     CHAR(4)     NOT NULL CHECK (last_4_digits ~ '^[0-9]{4}$'),  -- 4 digits
    expiry_year       INT         NOT NULL CHECK (expiry_year BETWEEN 2026 AND 2050),
    expiry_month      INT         NOT NULL CHECK (expiry_month BETWEEN 1 AND 12),
    PRIMARY KEY (payment_method_id),
    FOREIGN KEY (username) REFERENCES end_user (username)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id    SERIAL,
    payment_method_id SERIAL                              NOT NULL,
    amount            INTEGER                             NOT NULL CHECK (amount > 0),
    timestamp         TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (transaction_id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_method (payment_method_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post (
    post_id            SERIAL,
    username           VARCHAR(20)                         NOT NULL,
    title              VARCHAR(256)                        NOT NULL,
    content            VARCHAR(1024)                       NOT NULL,
    timestamp          TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (post_id),
    FOREIGN KEY (username) REFERENCES end_user (username)
        ON DELETE CASCADE
);