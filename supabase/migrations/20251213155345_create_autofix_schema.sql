/*
  # AutoFix Database Schema

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text) - Project name
      - `source_path` (text) - Local path or GitHub URL
      - `source_type` (text) - 'local' or 'github'
      - `status` (text) - 'pending', 'analyzing', 'repairing', 'success', 'failed'
      - `language` (text) - Detected language (js, ts)
      - `framework` (text) - Detected framework (react, vue, etc)
      - `package_manager` (text) - npm, yarn, pnpm
      - `total_attempts` (integer) - Number of repair iterations
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `repair_attempts`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `iteration` (integer) - Attempt number (1-5)
      - `command` (text) - Command that was run
      - `exit_code` (integer) - Process exit code
      - `stdout` (text) - Standard output
      - `stderr` (text) - Standard error
      - `error_detected` (boolean) - Whether error was detected
      - `ai_prompt` (text) - Prompt sent to AI
      - `ai_response` (jsonb) - AI response with fixes
      - `success` (boolean) - Whether this attempt succeeded
      - `created_at` (timestamptz)

    - `modified_files`
      - `id` (uuid, primary key)
      - `attempt_id` (uuid, foreign key)
      - `file_path` (text) - Relative file path
      - `old_content` (text) - Content before fix
      - `new_content` (text) - Content after fix
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public access for MVP (can add auth later)
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  source_path text NOT NULL,
  source_type text NOT NULL DEFAULT 'local',
  status text NOT NULL DEFAULT 'pending',
  language text,
  framework text,
  package_manager text DEFAULT 'npm',
  total_attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS repair_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  iteration integer NOT NULL,
  command text NOT NULL,
  exit_code integer,
  stdout text,
  stderr text,
  error_detected boolean DEFAULT false,
  ai_prompt text,
  ai_response jsonb,
  success boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS modified_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES repair_attempts(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  old_content text,
  new_content text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE modified_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to projects"
  ON projects FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to projects"
  ON projects FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to projects"
  ON projects FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to repair_attempts"
  ON repair_attempts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to repair_attempts"
  ON repair_attempts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public read access to modified_files"
  ON modified_files FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to modified_files"
  ON modified_files FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_repair_attempts_project_id ON repair_attempts(project_id);
CREATE INDEX IF NOT EXISTS idx_modified_files_attempt_id ON modified_files(attempt_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);