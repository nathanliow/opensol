-- Add is_public column to projects table if it doesn't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

-- Create index on is_public for faster queries of public projects
CREATE INDEX IF NOT EXISTS projects_is_public_idx ON projects(is_public);

-- Create policy to allow users to select public projects made by others
DROP POLICY IF EXISTS select_public_projects ON projects;
CREATE POLICY select_public_projects ON projects
  FOR SELECT USING (is_public = true);

-- Update the get_project function to allow viewing public projects
CREATE OR REPLACE FUNCTION get_project(project_id uuid)
RETURNS SETOF projects
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT * FROM projects WHERE id = project_id AND (user_id = auth.uid() OR is_public = true);
$$;

-- Create a secure function to get all public projects
CREATE OR REPLACE FUNCTION get_public_projects()
RETURNS SETOF projects
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT * FROM projects WHERE is_public = true;
$$;
