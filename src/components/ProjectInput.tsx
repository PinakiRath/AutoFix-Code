import { FolderOpen, Loader2 } from 'lucide-react';

interface ProjectInputProps {
  onSelectDirectory: () => void;
  isLoading: boolean;
  projectName: string | null;
}

export function ProjectInput({ onSelectDirectory, isLoading, projectName }: ProjectInputProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <FolderOpen className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Select Your Project
        </h2>
        <p className="text-gray-600 mb-6">
          Choose a JavaScript or TypeScript project directory to analyze and repair
        </p>
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
        {projectName && (
          <p className="mt-4 text-sm text-gray-600">
            Selected: <span className="font-medium text-gray-900">{projectName}</span>
          </p>
        )}
      </div>
    </div>
  );
}
