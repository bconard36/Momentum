CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
SET search_path = ''
AS $$
BEGIN 
  UPDATE public.users
  SET email = new.email
  WHERE user_id = new.id;
  RETURN new;
END;
$$;
