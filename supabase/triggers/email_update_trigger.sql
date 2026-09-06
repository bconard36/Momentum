CREATE TRIGGER on_auth_user_email_updated
AFTER UPDATE ON auth.users
FOR EACH row
WHEN (old.email IS DISTINCT FROM new.email) -- IMPORTANT - only update when email change is detected
EXECUTE PROCEDURE public.handle_user_email_update();