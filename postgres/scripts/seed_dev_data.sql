-- !psql

-- password: password123
-- TOTP uri: otpauth://totp/CyberBlog:email1%40email.com?secret=GRUC4SQTDS5VYNKFMIPMQ5IVXH65OCK3&issuer=CyberBlog
INSERT INTO end_user (username, password_hash, totp_secret, email)
VALUES (
    'user1',
    decode('5E54A1B3F13E4944A70F2A2A3313B98366856A13C70E48EEBC9403DA42219F89177E08939A20778DFEC7AB19447A5112', 'hex'),
    decode('0000000C0000002000000010E09EAC4F5B0956EEEE22731D11D21C26BDC085EB78199CB0350A3FFA083CE10953B2ABD0CAC1DEFF25DB423AD88DEFB241EBE9DAA882ABA88FF1F1E1', 'hex'),
    'example1@email.com'
);
INSERT INTO end_user (username, password_hash, totp_secret, email)
VALUES (
    'user2',
    decode('20351F0F4D8DC23054606BBC2132AEA311C646640C669D8937922EA02A0AFCCB925F838A7425CB7523D0F1DE0CD0F8FF', 'hex'),
    decode('27971DB385E5F8D07196E41DBEE61882CF52EEE161ADABDD951DDCB49592E8D1F0DBA9342418251F3CC11FEC25CEBCDB6FFC127C2AFD46FB1F4790BF', 'hex'),
    'example2@email.com'
);
INSERT INTO end_user (username, password_hash, totp_secret, email)
VALUES (
    'John Doe',
    decode('30351F0F4D8DC23054606BBC2132AEA311C646640C669D8937922EA02A0AFCCB925F838A7425CB7523D0F1DE0CD0F8FF', 'hex'),
    decode('37971DB385E5F8D07196E41DBEE61882CF52EEE161ADABDD951DDCB49592E8D1F0DBA9342418251F3CC11FEC25CEBCDB6FFC127C2AFD46FB1F4790BF', 'hex'),
    'johndoe@email.com'
);

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
