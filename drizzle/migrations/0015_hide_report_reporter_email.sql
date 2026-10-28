REVOKE SELECT ON public.resource_reports FROM anon, authenticated;
GRANT SELECT (
  id, resource_id, resource_type, resource_name, reason, details, status,
  resolution_note, resolved_at, created_at, updated_at
) ON public.resource_reports TO anon, authenticated;
