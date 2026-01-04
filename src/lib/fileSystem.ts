import { ProjectFile } from '../types';

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.nuxt',
  'coverage',
  '.cache',
]);

const TEXT_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
  '.css',
  '.scss',
  '.html',
  '.md',
  '.txt',
  '.yml',
  '.yaml',
  '.env',
  '.gitignore',
]);

export async function selectDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!('showDirectoryPicker' in window)) {
    alert('File System Access API is not supported in this browser. Please use Chrome, Edge, or another Chromium-based browser.');
    return null;
  }

  try {
    return await window.showDirectoryPicker();
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return null; // User cancelled
    }
    console.error('Directory selection error:', error);
    throw new Error('Failed to select directory. Please try again or use a different browser.');
  }
}

async function readFileAsText(fileHandle: FileSystemFileHandle): Promise<string> {
  const file = await fileHandle.getFile();
  return await file.text();
}

async function traverseDirectory(
  dirHandle: FileSystemDirectoryHandle,
  files: ProjectFile[],
  currentPath = ''
): Promise<void> {
  for await (const [name, handle] of dirHandle.entries()) {
    if (IGNORED_DIRS.has(name)) {
      continue;
    }

    const path = currentPath ? `${currentPath}/${name}` : name;

    if (handle.kind === 'directory') {
      files.push({ path, content: '', type: 'directory' });
      await traverseDirectory(handle, files, path);
    } else {
      const extension = name.substring(name.lastIndexOf('.'));
      if (TEXT_EXTENSIONS.has(extension)) {
        try {
          const content = await readFileAsText(handle);
          files.push({ path, content, type: 'file' });
        } catch (error) {
          console.warn(`Failed to read file ${path}:`, error);
        }
      }
    }
  }
}

export async function readProjectFiles(
  dirHandle: FileSystemDirectoryHandle
): Promise<ProjectFile[]> {
  const files: ProjectFile[] = [];
  await traverseDirectory(dirHandle, files);
  return files;
}

export function extractRelevantFiles(
  files: ProjectFile[],
  errorLog: string,
  maxFiles = 10
): ProjectFile[] {
  const errorKeywords = errorLog.toLowerCase();
  const scored = files
    .filter(f => f.type === 'file')
    .map(file => {
      let score = 0;

      if (errorKeywords.includes(file.path.toLowerCase())) {
        score += 100;
      }

      if (file.path.includes('package.json')) score += 50;
      if (file.path.includes('tsconfig') || file.path.includes('vite.config')) score += 30;
      if (file.path.match(/\.(tsx?|jsx?)$/)) score += 20;
      if (file.path.includes('/src/')) score += 10;

      const pathParts = file.path.split('/');
      for (const part of pathParts) {
        if (errorKeywords.includes(part.toLowerCase())) {
          score += 20;
        }
      }

      return { file, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, maxFiles).map(item => item.file);
}

export function getFileTree(files: ProjectFile[]): string[] {
  return files.map(f => f.path).sort();
}

export async function downloadFile(filename: string, content: string): Promise<void> {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
