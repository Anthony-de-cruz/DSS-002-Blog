-- !psql
INSERT INTO end_user (username, password_hash, totp_secret, email, premium, admin) VALUES
    -- password: 123passwords
    -- TOTP uri: otpauth://totp/CyberBlog:example0%40email.com?secret=WZWESFPVT7SKK63F5JW27PEV7LI67664&issuer=CyberBlog
    ('user0',
    decode('42D5933C3437FC24386B7E6CC5E63ADEDE382630AE8820111A6D26059FEE5619AB7303A40027BE12E3D12E4302E7A0E4', 'hex'),
    decode('0000000C000000200000001009C2419F74D98478CF53603E30E65D08218B2466525B3608B8F3958977EA7F5A69759C1FE3B957F76ADBAFC75409F8113DDA7EFEFAB5B5113A10CCA5', 'hex'),
    'example0@email.com',
    false,
    false),
    -- password: password123
    -- TOTP uri: otpauth://totp/CyberBlog:example1%40email.com?secret=GRUC4SQTDS5VYNKFMIPMQ5IVXH65OCK3&issuer=CyberBlog
    ('user1',
    decode('5E54A1B3F13E4944A70F2A2A3313B98366856A13C70E48EEBC9403DA42219F89177E08939A20778DFEC7AB19447A5112', 'hex'),
    decode('0000000C0000002000000010E09EAC4F5B0956EEEE22731D11D21C26BDC085EB78199CB0350A3FFA083CE10953B2ABD0CAC1DEFF25DB423AD88DEFB241EBE9DAA882ABA88FF1F1E1', 'hex'),
    'example1@email.com',
    false,
    false),
    -- password: admin0password
    -- TOTP uri: otpauth://totp/CyberBlog:admin0%40email.com?secret=3ADQUFHOXBD5XM5TZ4HMVFL4BDKQSZX2&issuer=CyberBlog
    ('admin0',
    decode('C694CA4D3BFDBE5DA57E706E25011F343D706F83AE9A3DE05C1DAADB5A5CE37DB4F66E8129A7696C82DD992FEC396F43', 'hex'),
    decode('0000000C00000020000000103183E88F2F587C1FE91322DF7C7FF246A1C268C2F63E989992E1D273C209C125244B813E55B532CF92F42D95C76C102A2072CC5076D76F194D4849A2', 'hex'),
    'admin0@email.com',
    true,
    true);

INSERT INTO payment_method (username, last_4_digits, expiry_year, expiry_month) VALUES
    ('user0', '1234', 2030, 1),
    ('user1', '1235', 2029, 12);

INSERT INTO transactions (payment_method_id, amount) VALUES
    (1, 10),
    (1, 12),
    (2, 10);

UPDATE end_user
SET premium = TRUE
WHERE username = 'user1';
INSERT INTO post (username, title, content, timestamp) VALUES
    ('user0', 'To Sprinkle or Not To Sprinkle', 'What do you consider to be the classic donut? Sprinkled or glazed? Does a simple glaze cut it? There''s hundreds and thousands of options to consider.', '2024-11-23 13:37:02'),
    ('user0', 'Pancakes or Waffles: The Never Ending Debate', 'Why do we feel the need to pit them against one another? Why can''t pancakes and waffles live in harmony?', '2024-11-23 19:14:16'),
    ('user1', 'Dessert Sushi - should it exist?', 'I personally think it is an abomination. ''Red Hots'' are not a suitable wasabi substitute!', '2024-11-24 15:14:32'),
    ('user1', 'How to make your website secure!', 'The disposal all nodejs developers would see a decrease in chimpanzee levels of code quality and security. ', '2026-03-12 10:42:45');
