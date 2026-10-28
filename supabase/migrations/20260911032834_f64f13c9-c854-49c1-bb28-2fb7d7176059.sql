ALTER TABLE public.bronx_resources
  ADD COLUMN IF NOT EXISTS listing_type text NOT NULL DEFAULT 'service';

ALTER TABLE public.bronx_resources
  DROP CONSTRAINT IF EXISTS bronx_resources_listing_type_check;
ALTER TABLE public.bronx_resources
  ADD CONSTRAINT bronx_resources_listing_type_check
  CHECK (listing_type IN ('service', 'business'));

CREATE INDEX IF NOT EXISTS bronx_resources_listing_type_idx
  ON public.bronx_resources (listing_type);

INSERT INTO public.bronx_resource_categories (id, domain, label, subcategories, active, sort_order)
VALUES
  ('restaurants_dining', 'food_benefits', 'Restaurants & Dining', ARRAY['Restaurant','Cafe','Bakery','Market vendor']::text[], true, 60),
  ('nightlife', 'recreation', 'Nightlife & Bars', ARRAY['Bar','Brewery','Live music','Lounge']::text[], true, 210),
  ('retail', 'retail', 'Retail', ARRAY['Clothing','Grocery store','Specialty shop','Home goods']::text[], true, 220),
  ('services', 'services', 'Services', ARRAY['Professional services','Repair','Beauty & barber','Other services']::text[], true, 230),
  ('recreation', 'recreation', 'Recreation', ARRAY['Fitness','Sports','Community events']::text[], true, 240)
ON CONFLICT (id) DO UPDATE
  SET label = EXCLUDED.label,
      subcategories = EXCLUDED.subcategories,
      active = EXCLUDED.active,
      sort_order = EXCLUDED.sort_order;

UPDATE public.bronx_resource_categories SET active = true WHERE id = 'healthcare';