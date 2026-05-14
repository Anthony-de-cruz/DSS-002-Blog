-- !psql

CREATE TABLE IF NOT EXISTS end_user (
    username      VARCHAR(20),
    password_hash BYTEA        NOT NULL UNIQUE CHECK (octet_length(password_hash) <= 48), -- TODO: Set these to = rather than <=.
    totp_secret   BYTEA        NOT NULL UNIQUE CHECK (octet_length(totp_secret) > 12),
    email         VARCHAR(30)  NOT NULL UNIQUE,
    premium       BOOLEAN      DEFAULT FALSE NOT NULL,
    admin         BOOLEAN      DEFAULT FALSE NOT NULL,
    PRIMARY KEY (username)
);

CREATE TABLE IF NOT EXISTS payment_method (
    payment_method_id         SERIAL,
    username                  VARCHAR(20) NOT NULL,
    encrypted_payment_details BYTEA       NOT NULL CHECK (octet_length(encrypted_payment_details) > 12),
    PRIMARY KEY (payment_method_id),
    FOREIGN KEY (username) REFERENCES end_user (username)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id    SERIAL,
    payment_method_id SERIAL                              NOT NULL,
    amount            INTEGER                             NOT NULL CHECK (amount > 0),
    timestamp         TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (transaction_id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_method (payment_method_id)
        ON UPDATE CASCADE
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
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
