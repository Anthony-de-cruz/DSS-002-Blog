CREATE OR REPLACE FUNCTION validate_password()
    RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM blacklisted_passwords WHERE password = NEW.password) THEN
        RAISE EXCEPTION 'Password is blacklisted';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER end_user_validate_password
    BEFORE INSERT OR UPDATE ON end_user
    FOR EACH ROW
EXECUTE FUNCTION validate_password();