-- Ask questions are logged (with phone numbers and emails removed) so staff
-- can see what residents need. They aren't linked to a person, so they can't
-- be deleted per person; instead they are kept for 90 days at most.

CREATE OR REPLACE FUNCTION public.prune_old_ask_questions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.ask_questions WHERE created_at < now() - interval '90 days';
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS ask_questions_prune ON public.ask_questions;
CREATE TRIGGER ask_questions_prune
AFTER INSERT ON public.ask_questions
FOR EACH STATEMENT EXECUTE FUNCTION public.prune_old_ask_questions();

DELETE FROM public.ask_questions WHERE created_at < now() - interval '90 days';
