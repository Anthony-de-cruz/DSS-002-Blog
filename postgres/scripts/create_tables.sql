-- !psql

CREATE TABLE IF NOT EXISTS user -- PLACEHOLDER
(
    username     VARCHAR(20) NOT NULL,
    password     VARCHAR(20) NOT NULL,
    PRIMARY KEY (username)
);
