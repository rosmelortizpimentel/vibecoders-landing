-- Create showcase_gallery table for Community Showcase
CREATE TABLE public.showcase_gallery (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  project_title text NOT NULL,
  project_tagline text NOT NULL,
  project_url text NOT NULL,
  project_thumbnail text NOT NULL,
  author_name text NOT NULL,
  author_avatar text,
  author_linkedin text,
  author_twitter text,
  author_website text,
  display_order numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.showcase_gallery ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (only active projects)
CREATE POLICY "Public can view active showcase projects" 
ON public.showcase_gallery 
FOR SELECT 
USING (is_active = true);

-- Create index for ordering
CREATE INDEX idx_showcase_gallery_display_order ON public.showcase_gallery (display_order ASC);

-- Add comment for documentation
COMMENT ON TABLE public.showcase_gallery IS 'Gallery of community projects for the Inspiration/Showcase section';