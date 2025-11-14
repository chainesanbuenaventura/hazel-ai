-- Completely disable RLS and create permissive policies
-- This script will fix all RLS-related errors

-- Disable RLS on all tables
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_documents DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.campaigns;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.candidates;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.jobs;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.campaign_candidates;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.job_documents;

-- Grant full permissions to authenticated and anonymous users
GRANT ALL ON public.campaigns TO authenticated;
GRANT ALL ON public.candidates TO authenticated;
GRANT ALL ON public.jobs TO authenticated;
GRANT ALL ON public.campaign_candidates TO authenticated;
GRANT ALL ON public.job_documents TO authenticated;

GRANT ALL ON public.campaigns TO anon;
GRANT ALL ON public.candidates TO anon;
GRANT ALL ON public.jobs TO anon;
GRANT ALL ON public.campaign_candidates TO anon;
GRANT ALL ON public.job_documents TO anon;

-- Create permissive storage policies
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
  'allow-all-documents',
  'documents',
  'Allow all operations on documents',
  'true',
  'true',
  'ALL'
) ON CONFLICT (id) DO UPDATE SET
  definition = 'true',
  check_definition = 'true';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON public.candidates(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_campaign_candidates_campaign_id ON public.campaign_candidates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_candidates_candidate_id ON public.campaign_candidates(candidate_id);

-- Insert sample data for testing
INSERT INTO public.campaigns (name, job_description, status, created_by) VALUES
('Senior Frontend Developer', 'Looking for a senior frontend developer with React experience', 'active', null),
('Backend Engineer', 'Python/Django backend engineer needed', 'draft', null),
('Full Stack Developer', 'Full stack developer with modern web technologies', 'active', null)
ON CONFLICT DO NOTHING;

INSERT INTO public.candidates (name, email, phone, skills, experience_years, created_by) VALUES
('John Doe', 'john@example.com', '+1234567890', ARRAY['React', 'JavaScript', 'TypeScript'], 5, null),
('Jane Smith', 'jane@example.com', '+1234567891', ARRAY['Python', 'Django', 'PostgreSQL'], 3, null),
('Bob Johnson', 'bob@example.com', '+1234567892', ARRAY['Node.js', 'React', 'MongoDB'], 4, null)
ON CONFLICT DO NOTHING;

INSERT INTO public.jobs (title, description, requirements, salary_min, salary_max, location, created_by) VALUES
('Senior React Developer', 'Senior React developer position', ARRAY['React', 'TypeScript', '5+ years experience'], 80000, 120000, 'Remote', null),
('Python Backend Engineer', 'Backend engineer with Python expertise', ARRAY['Python', 'Django', 'PostgreSQL'], 70000, 100000, 'New York', null),
('Full Stack Engineer', 'Full stack engineer position', ARRAY['React', 'Node.js', 'MongoDB'], 75000, 110000, 'San Francisco', null)
ON CONFLICT DO NOTHING;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_candidates_updated_at ON public.candidates;
CREATE TRIGGER update_candidates_updated_at
    BEFORE UPDATE ON public.candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
