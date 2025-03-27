-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table to store additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT user_profiles_user_id_key UNIQUE (user_id)
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);

-- Set up Row Level Security (RLS) for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
-- Policy to allow users to select their own profile
CREATE POLICY select_own_profile ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own profile
CREATE POLICY insert_own_profile ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own profile
CREATE POLICY update_own_profile ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_public BOOLEAN NOT NULL DEFAULT false
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
-- Create index on is_public for faster queries of public projects
CREATE INDEX IF NOT EXISTS projects_is_public_idx ON projects(is_public);

-- Set up Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies with more permissive checks
-- Policy to allow users to select their own projects
CREATE POLICY select_own_projects ON projects
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to select public projects made by others
CREATE POLICY select_public_projects ON projects
  FOR SELECT USING (is_public = true);

-- Policy to allow users to insert their own projects
-- This policy ensures the user can only create projects with their own user_id
CREATE POLICY insert_own_projects ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update only their own projects
CREATE POLICY update_own_projects ON projects
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete only their own projects
CREATE POLICY delete_own_projects ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically set updated_at when a row is updated
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Create a secure function to get the current user's projects
CREATE OR REPLACE FUNCTION get_user_projects()
RETURNS SETOF projects
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT * FROM projects WHERE user_id = auth.uid();
$$;

-- Create a secure function to get a specific project if it belongs to the current user
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
