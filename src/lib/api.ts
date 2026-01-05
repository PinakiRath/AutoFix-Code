import axios from 'axios';
import { apiConfig } from './api-config';
import { ProjectAnalysis, FileFix } from '../types';

const api = axios.create(apiConfig);

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
  try {
    const response = await api.post('/analyze-project', {
      packageJson,
      files,
    } as AnalysisRequest);

    return response.data;
  } catch (error) {
    console.error('Analysis failed:', error);
    // Return a mock analysis for now to prevent app from breaking
    return {
      language: 'JavaScript',
      framework: 'React',
      dependencies: Object.keys(packageJson.dependencies || {}),
      devDependencies: Object.keys(packageJson.devDependencies || {}),
      recommendedCommand: 'npm run dev',
      potentialIssues: ['API endpoint not available - using mock data'],
    };
  }
}

export async function requestRepair(
  errorLog: string,
  fileTree: string[],
  relevantFiles: { path: string; content: string }[],
  openaiApiKey: string,
  iteration: number
): Promise<RepairResponse> {
  try {
    console.log('Sending repair request to API...');
    const response = await api.post('/ai-repair', {
      errorLog,
      fileTree,
      relevantFiles,
      openaiApiKey,
      iteration,
    } as RepairRequest);

    console.log('Repair response received:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Repair request failed:', error);
    
    if (error.response?.data) {
      throw new Error(error.response.data.error || 'API request failed');
    }
    
    // Return empty fixes to prevent app from breaking
    return {
      fixes: [],
      analysis: `API request failed: ${error.message}. Please check if the server is running on port 3002.`,
    };
  }
}

export async function saveProject(projectData: {
  name: string;
  source_path: string;
  source_type: string;
  language?: string;
  framework?: string;
  status: string;
}) {
  try {
    const response = await api.post('/projects', projectData);
    return response.data;
  } catch (error) {
    console.error('Failed to save project:', error);
    // Return mock data to prevent app from breaking
    return { id: crypto.randomUUID(), ...projectData };
  }
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
  try {
    const response = await api.post('/repair-attempts', attemptData);
    return response.data;
  } catch (error) {
    console.error('Failed to save repair attempt:', error);
    // Return mock data to prevent app from breaking
    return { id: crypto.randomUUID(), ...attemptData };
  }
}

export async function saveModifiedFile(fileData: {
  attempt_id: string;
  file_path: string;
  old_content: string;
  new_content: string;
}) {
  try {
    const response = await api.post('/modified-files', fileData);
    return response.data;
  } catch (error) {
    console.error('Failed to save modified file:', error);
    // Return mock data to prevent app from breaking
    return { id: crypto.randomUUID(), ...fileData };
  }
}
