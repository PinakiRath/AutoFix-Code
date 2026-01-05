import { useState } from 'react';
import { Wrench } from 'lucide-react';
import { ProjectInput } from './components/ProjectInput';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { ErrorInput } from './components/ErrorInput';
import { RepairProgress } from './components/RepairProgress';
import { FixedFiles } from './components/FixedFiles';
import { ProjectAnalysis, RepairAttempt, ProjectFile, FileFix } from './types';
import { selectDirectory, readProjectFiles, getFileTree, extractRelevantFiles } from './lib/fileSystem';
import { analyzeProject, requestRepair, saveProject, saveRepairAttempt, saveModifiedFile } from './lib/api';

const MAX_ITERATIONS = 5;

function App() {
  const [projectName, setProjectName] = useState<string | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attempts, setAttempts] = useState<RepairAttempt[]>([]);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [allFixes, setAllFixes] = useState<FileFix[]>([]);

  const handleSelectDirectory = async () => {
    try {
      setIsLoading(true);
      const dirHandle = await selectDirectory();

      if (!dirHandle) {
        setIsLoading(false);
        return;
      }

      setProjectName(dirHandle.name);
      const files = await readProjectFiles(dirHandle);
      setProjectFiles(files);

      console.log('Files found:', files.map(f => f.path));

      // Look for package.json at root or in subdirectories
      let packageJsonFile = files.find(f => f.path === 'package.json');
      
      if (!packageJsonFile) {
        // Look for package.json in subdirectories
        packageJsonFile = files.find(f => f.path.endsWith('/package.json') && f.path.split('/').length === 2);
      }

      let packageJson = {};
      let projectAnalysis;

      if (packageJsonFile) {
        // Node.js project with package.json
        try {
          packageJson = JSON.parse(packageJsonFile.content);
          console.log('Found package.json:', packageJson);
        } catch (error) {
          console.error('Failed to parse package.json:', error);
          alert('Found package.json but failed to parse it. Please check if it\'s valid JSON.');
          setIsLoading(false);
          return;
        }
      } else {
        // Project without package.json - analyze based on file types
        console.log('No package.json found, analyzing file types...');
        const hasReactFiles = files.some(f => f.path.includes('.jsx') || f.path.includes('.tsx'));
        const hasVueFiles = files.some(f => f.path.includes('.vue'));
        const hasTypeScript = files.some(f => f.path.includes('.ts') || f.path.includes('.tsx'));
        const hasJavaScript = files.some(f => f.path.includes('.js') || f.path.includes('.jsx'));
        const hasHTML = files.some(f => f.path.includes('.html'));
        const hasCSS = files.some(f => f.path.includes('.css') || f.path.includes('.scss'));

        // Create a mock package.json for analysis
        packageJson = {
          name: dirHandle.name,
          version: '1.0.0',
          dependencies: {},
          devDependencies: {}
        };

        // Add likely dependencies based on file types
        if (hasReactFiles) {
          (packageJson as any).dependencies.react = '^18.0.0';
          (packageJson as any).dependencies['react-dom'] = '^18.0.0';
        }
        if (hasVueFiles) {
          (packageJson as any).dependencies.vue = '^3.0.0';
        }
        if (hasTypeScript) {
          (packageJson as any).devDependencies.typescript = '^4.0.0';
        }

        console.log('Generated mock package.json:', packageJson);
      }

      const fileTree = getFileTree(files);
      projectAnalysis = await analyzeProject(packageJson, fileTree);
      setAnalysis(projectAnalysis);

      const project = await saveProject({
        name: dirHandle.name,
        source_path: dirHandle.name,
        source_type: packageJsonFile ? 'local' : 'local-no-package-json',
        language: projectAnalysis.language,
        framework: projectAnalysis.framework || undefined,
        status: 'analyzing',
      });

      setProjectId(project.id);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading project:', error);
      alert(`Failed to load project: ${(error as Error).message}`);
      setIsLoading(false);
    }
  };

  const handleDemoProject = async () => {
    try {
      setIsLoading(true);
      setProjectName('Demo React Project');
      
      // Create a demo project structure with more files
      const demoFiles: ProjectFile[] = [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: 'demo-react-app',
            version: '1.0.0',
            type: 'module',
            dependencies: {
              'react': '^18.2.0',
              'react-dom': '^18.2.0'
            },
            devDependencies: {
              'vite': '^4.0.0',
              'typescript': '^4.9.0',
              '@types/react': '^18.0.0',
              '@types/react-dom': '^18.0.0'
            },
            scripts: {
              'dev': 'vite',
              'build': 'vite build',
              'preview': 'vite preview'
            }
          }, null, 2),
          type: 'file'
        },
        {
          path: 'src/App.tsx',
          content: `import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Demo React App</h1>
      <p>This is a demo project for testing AutoFix functionality.</p>
    </div>
  );
}

export default App;`,
          type: 'file'
        },
        {
          path: 'src/main.tsx',
          content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
          type: 'file'
        },
        {
          path: 'index.html',
          content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Demo React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
          type: 'file'
        },
        {
          path: 'vite.config.ts',
          content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
          type: 'file'
        }
      ];
      
      console.log('Demo files created:', demoFiles);
      setProjectFiles(demoFiles);

      // Find and parse package.json
      const packageJsonFile = demoFiles.find(f => f.path === 'package.json');
      console.log('Package.json file found:', packageJsonFile);
      console.log('All file paths:', demoFiles.map(f => f.path));
      
      if (!packageJsonFile) {
        console.error('Demo package.json not found in files:', demoFiles.map(f => ({ path: f.path, type: f.type })));
        throw new Error('Demo package.json not found');
      }

      const packageJson = JSON.parse(packageJsonFile.content);
      console.log('Parsed package.json:', packageJson);
      
      const fileTree = getFileTree(demoFiles);
      console.log('File tree:', fileTree);
      
      const projectAnalysis = await analyzeProject(packageJson, fileTree);
      console.log('Project analysis:', projectAnalysis);
      
      setAnalysis(projectAnalysis);

      const project = await saveProject({
        name: 'Demo React Project',
        source_path: 'demo',
        source_type: 'demo',
        language: projectAnalysis.language,
        framework: projectAnalysis.framework || undefined,
        status: 'analyzing',
      });

      console.log('Project saved:', project);
      setProjectId(project.id);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading demo project:', error);
      alert(`Failed to load demo project: ${(error as Error).message}`);
      setIsLoading(false);
    }
  };

  const handleSubmitError = async (errorLog: string) => {
    if (!projectId || !analysis) {
      alert('Please select a project first.');
      return;
    }

    setIsProcessing(true);
    setCurrentIteration(1);

    try {
      await runRepairLoop(errorLog);
    } catch (error) {
      console.error('Repair failed:', error);
      alert(`Repair process failed: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const runRepairLoop = async (initialErrorLog: string) => {
    let errorLog = initialErrorLog;
    let iteration = 1;
    const fixesApplied: FileFix[] = [];

    while (iteration <= MAX_ITERATIONS) {
      setCurrentIteration(iteration);

      const fileTree = getFileTree(projectFiles);
      const relevantFiles = extractRelevantFiles(projectFiles, errorLog);
      const relevantFilesData = relevantFiles.map(f => ({
        path: f.path,
        content: f.content,
      }));

      try {
        const repairResponse = await requestRepair(
          errorLog,
          fileTree,
          relevantFilesData,
          '', // No API key needed since server handles it
          iteration
        );

        const attemptData: RepairAttempt = {
          id: crypto.randomUUID(),
          iteration,
          command: analysis?.recommendedCommand || 'npm run dev',
          errorLog,
          fixes: repairResponse.fixes,
          success: false,
          timestamp: new Date(),
        };

        if (projectId) {
          const savedAttempt = await saveRepairAttempt({
            project_id: projectId,
            iteration,
            command: attemptData.command,
            stderr: errorLog,
            error_detected: true,
            ai_prompt: JSON.stringify({ errorLog, fileTree, relevantFiles: relevantFilesData }),
            ai_response: repairResponse,
            success: false,
          });

          for (const fix of repairResponse.fixes) {
            const oldFile = projectFiles.find(f => f.path === fix.path);
            await saveModifiedFile({
              attempt_id: savedAttempt.id,
              file_path: fix.path,
              old_content: oldFile?.content || '',
              new_content: fix.content,
            });
          }
        }

        fixesApplied.push(...repairResponse.fixes);
        setAllFixes(fixesApplied);

        const updatedFiles = projectFiles.map(file => {
          const fix = repairResponse.fixes.find(f => f.path === file.path);
          return fix ? { ...file, content: fix.content } : file;
        });
        setProjectFiles(updatedFiles);

        setAttempts(prev => [...prev, attemptData]);

        if (repairResponse.fixes.length === 0) {
          attemptData.success = true;
          setAttempts(prev => {
            const updated = [...prev];
            updated[updated.length - 1].success = true;
            return updated;
          });
          break;
        }

        iteration++;
      } catch (error) {
        console.error(`Iteration ${iteration} failed:`, error);
        const failedAttempt: RepairAttempt = {
          id: crypto.randomUUID(),
          iteration,
          command: analysis?.recommendedCommand || 'npm run dev',
          errorLog: `Repair iteration failed: ${error}`,
          fixes: [],
          success: false,
          timestamp: new Date(),
        };
        setAttempts(prev => [...prev, failedAttempt]);
        break;
      }
    }

    if (iteration > MAX_ITERATIONS) {
      alert(`Reached maximum iterations (${MAX_ITERATIONS}). Some issues may remain.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 dark">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">AutoFix</h1>
          <p className="text-lg text-gray-300">
            AI-powered code repair system for JavaScript and TypeScript projects
          </p>
        </header>

        <div className="space-y-6">
          {!projectName && (
            <ProjectInput
              onSelectDirectory={handleSelectDirectory}
              onDemoProject={handleDemoProject}
              isLoading={isLoading}
              projectName={projectName}
            />
          )}

          {projectName && !analysis && isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-blue-500"></div>
              <p className="mt-4 text-gray-300">Analyzing project...</p>
            </div>
          )}

          {analysis && (
            <>
              <AnalysisDisplay analysis={analysis} />

              {attempts.length === 0 && (
                <ErrorInput
                  onSubmitError={handleSubmitError}
                  isProcessing={isProcessing}
                />
              )}

              {attempts.length > 0 && (
                <RepairProgress
                  attempts={attempts}
                  currentIteration={currentIteration}
                  maxIterations={MAX_ITERATIONS}
                />
              )}

              {allFixes.length > 0 && <FixedFiles fixes={allFixes} />}
            </>
          )}
        </div>

        <footer className="mt-12 text-center text-sm text-gray-400">
          <p>Select a project, paste your error logs, and let AI fix your code automatically</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
