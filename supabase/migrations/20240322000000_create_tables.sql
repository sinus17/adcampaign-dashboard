-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE report_status AS ENUM ('generating', 'ready', 'error');

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    platforms TEXT[] NOT NULL,
    metrics TEXT[] NOT NULL,
    campaigns TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    status report_status DEFAULT 'generating' NOT NULL,
    share_url TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    enable_date_range BOOLEAN DEFAULT false NOT NULL
);

-- Create RLS policies
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policies for reports
CREATE POLICY "Enable read access for all users" ON public.reports
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.reports
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.reports
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.reports
    FOR DELETE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON public.reports(created_at);
CREATE INDEX IF NOT EXISTS reports_id_idx ON public.reports(id);

-- Add triggers for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();