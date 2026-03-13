-- !psql

INSERT INTO blacklisted_passwords(password)
VALUES ('password'),
       ('password123'),
       ('12345678'),
       ('qwerty123'),
       ('abc12345');

INSERT INTO end_user (username, password, email)
VALUES ('user1', 'password', 'example@email.com');
INSERT INTO end_user (username, password, email)
VALUES ('user2', 'password123', 'example@email.com');

INSERT INTO payment_method (username, last_4_digits, expiry_year, expiry_month)
VALUES ('user1', '1234', 2030, 1);
INSERT INTO payment_method (username, last_4_digits, expiry_year, expiry_month)
VALUES ('user2', '1235', 2029, 12);

INSERT INTO transactions (payment_method_id, amount)
VALUES (1, 10);
INSERT INTO transactions (payment_method_id, amount)
VALUES (1, 12);
INSERT INTO transactions (payment_method_id, amount)
VALUES (2, 10);

UPDATE end_user
SET premium = TRUE
WHERE username = 'user1'