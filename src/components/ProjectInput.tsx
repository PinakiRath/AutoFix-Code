import { FolderOpen, Loader2, Play } from 'lucide-react';

interface ProjectInputProps {
  onSelectDirectory: () => void;
  onDemoProject: () => void;
  isLoading: boolean;
  projectName: string | null;
}

export function ProjectInput({ onSelectDirectory, onDemoProject, isLoading, projectName }: ProjectInputProps) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 rounded-full mb-4">
          <FolderOpen className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Select Your Project
        </h2>
        <p className="text-gray-300 mb-6">
          Choose a JavaScript or TypeScript project directory to analyze and repair
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onSelectDirectory}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading Project...
              </>
            ) : (
              <>
                <FolderOpen className="w-5 h-5" />
                Select Directory
              </>
            )}
          </button>
          
          <button
            onClick={onDemoProject}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            Try Demo Project
          </button>
        </div>
        
        {projectName && (
          <p className="mt-4 text-sm text-gray-300">
            Selected: <span className="font-medium text-white">{projectName}</span>
          </p>
        )}
        
        <div className="mt-6 text-xs text-gray-400">
          <p>Select Directory requires Chrome/Edge browser with File System Access API</p>
          <p>Use Demo Project to test the functionality without file access</p>
        </div>
      </div>
    </div>
  );
}
