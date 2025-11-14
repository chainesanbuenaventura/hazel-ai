-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies on storage.objects if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own documents" ON storage.objects;

-- Create policy to allow all operations on documents bucket
CREATE POLICY "Allow all operations on documents" ON storage.objects
FOR ALL USING (bucket_id = 'documents') WITH CHECK (bucket_id = 'documents');

-- Create table to track uploaded job documents
DROP TABLE IF EXISTS job_documents CASCADE;
CREATE TABLE job_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID DEFAULT NULL
);

-- Create table for campaigns
DROP TABLE IF EXISTS campaigns CASCADE;
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  job_description TEXT,
  job_document_url TEXT,
  status TEXT DEFAULT 'draft',
  webhook_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID DEFAULT NULL
);

-- Create table for candidates
DROP TABLE IF EXISTS candidates CASCADE;
CREATE TABLE candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  resume_url TEXT,
  skills TEXT[],
  experience_years INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID DEFAULT NULL
);

-- Create jobs table
DROP TABLE IF EXISTS jobs CASCADE;
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT[],
  location TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID DEFAULT NULL
);

-- Create campaign_candidates junction table
DROP TABLE IF EXISTS campaign_candidates CASCADE;
CREATE TABLE campaign_candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  match_score DECIMAL(3,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, candidate_id)
);

-- Completely disable RLS for all tables
ALTER TABLE job_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_candidates DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_campaign_candidates_campaign_id ON campaign_candidates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_candidates_candidate_id ON campaign_candidates(candidate_id);

-- Insert some sample data
INSERT INTO campaigns (name, job_description, status) VALUES
('Senior Frontend Developer Q1 2024', 'Looking for an experienced React developer to join our team', 'active'),
('Product Manager - Growth', 'Seeking a product manager to drive growth initiatives', 'active'),
('UX Designer - Remote', 'Remote UX designer position for our design team', 'paused')
ON CONFLICT DO NOTHING;

INSERT INTO candidates (name, email, phone, skills, experience_years) VALUES
('John Doe', 'john.doe@example.com', '+1-555-0123', ARRAY['React', 'TypeScript', 'Node.js'], 5),
('Jane Smith', 'jane.smith@example.com', '+1-555-0124', ARRAY['Product Management', 'Analytics', 'Strategy'], 7),
('Mike Johnson', 'mike.johnson@example.com', '+1-555-0125', ARRAY['UI/UX Design', 'Figma', 'Prototyping'], 4)
ON CONFLICT (email) DO NOTHING;

INSERT INTO jobs (title, description, requirements, location, salary_min, salary_max) VALUES
('Senior Frontend Developer', 'We are looking for a senior frontend developer to join our team...', ARRAY['React', 'TypeScript', '5+ years experience'], 'San Francisco, CA', 120000, 160000),
('Product Manager', 'Lead product strategy and development for our core platform...', ARRAY['Product Management', 'Analytics', '5+ years experience'], 'New York, NY', 130000, 170000),
('UX Designer', 'Create beautiful and intuitive user experiences...', ARRAY['UI/UX Design', 'Figma', '3+ years experience'], 'Remote', 90000, 120000)
ON CONFLICT DO NOTHING;
