export interface ProjectFile {
  path: string;
  content: string;
  type: 'file' | 'directory';
}

export interface ProjectAnalysis {
  language: string;
  framework: string | null;
  packageManager: string;
  hasTypeScript: boolean;
  availableScripts: string[];
  recommendedCommand: string;
}

export interface RepairAttempt {
  id: string;
  iteration: number;
  command: string;
  errorLog: string;
  fixes: FileFix[];
  success: boolean;
  timestamp: Date;
}

export interface FileFix {
  path: string;
  content: string;
  reason: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'idle' | 'analyzing' | 'repairing' | 'success' | 'failed';
  analysis?: ProjectAnalysis;
  attempts: RepairAttempt[];
  files: Map<string, string>;
}
