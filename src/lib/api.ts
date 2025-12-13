import { supabase } from './supabase';
import { ProjectAnalysis, FileFix } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface AnalysisRequest {
  packageJson: Record<string, unknown>;
  files: string[];
}

interface RepairRequest {
  errorLog: string;
  fileTree: string[];
  relevantFiles: { path: string; content: string }[];
  openaiApiKey: string;
  iteration: number;
}

interface RepairResponse {
  fixes: FileFix[];
  analysis: string;
}

export async function analyzeProject(
  packageJson: Record<string, unknown>,
  files: string[]
): Promise<ProjectAnalysis> {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/analyze-project`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ packageJson, files } as AnalysisRequest),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Analysis failed: ${error}`);
  }

  return response.json();
}

export async function requestRepair(
  errorLog: string,
  fileTree: string[],
  relevantFiles: { path: string; content: string }[],
  openaiApiKey: string,
  iteration: number
): Promise<RepairResponse> {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/ai-repair`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        errorLog,
        fileTree,
        relevantFiles,
        openaiApiKey,
        iteration,
      } as RepairRequest),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Repair request failed: ${error}`);
  }

  return response.json();
}

export async function saveProject(projectData: {
  name: string;
  source_path: string;
  source_type: string;
  language?: string;
  framework?: string;
  status: string;
}) {
  const { data, error } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveRepairAttempt(attemptData: {
  project_id: string;
  iteration: number;
  command: string;
  exit_code?: number;
  stdout?: string;
  stderr: string;
  error_detected: boolean;
  ai_prompt?: string;
  ai_response?: unknown;
  success: boolean;
}) {
  const { data, error } = await supabase
    .from('repair_attempts')
    .insert(attemptData)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveModifiedFile(fileData: {
  attempt_id: string;
  file_path: string;
  old_content: string;
  new_content: string;
}) {
  const { data, error } = await supabase
    .from('modified_files')
    .insert(fileData)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}
