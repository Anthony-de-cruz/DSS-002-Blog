-- !psql

INSERT INTO end_user (username, password_hash, password_salt, totp_secret, email)
VALUES ('user1', decode('AAAA', 'hex'), decode('BBBB', 'hex'), decode('CCCC', 'hex'), 'example1@email.com');
INSERT INTO end_user (username, password_hash, password_salt, totp_secret, email)
VALUES ('user2', decode('AAAB', 'hex'), decode('BBBC', 'hex'), decode('CCCD', 'hex'), 'example2@email.com');

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
