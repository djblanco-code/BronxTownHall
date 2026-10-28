GRANT SELECT ON public.bronx_resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bronx_resources TO authenticated;
GRANT ALL ON public.bronx_resources TO service_role;

GRANT SELECT ON public.bronx_resource_sources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bronx_resource_sources TO authenticated;
GRANT ALL ON public.bronx_resource_sources TO service_role;

GRANT SELECT ON public.bronx_resource_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bronx_resource_categories TO authenticated;
GRANT ALL ON public.bronx_resource_categories TO service_role;

GRANT SELECT, INSERT ON public.bronx_resource_imports TO authenticated;
GRANT ALL ON public.bronx_resource_imports TO service_role;