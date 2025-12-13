import { CheckCircle2, Code2, Package, Terminal } from 'lucide-react';
import { ProjectAnalysis } from '../types';

interface AnalysisDisplayProps {
  analysis: ProjectAnalysis;
}

export function AnalysisDisplay({ analysis }: AnalysisDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Project Analysis</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded">
            <Code2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Language</p>
            <p className="font-medium text-gray-900 capitalize">{analysis.language}</p>
          </div>
        </div>

        {analysis.framework && (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Framework</p>
              <p className="font-medium text-gray-900 capitalize">{analysis.framework}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 rounded">
            <Terminal className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Package Manager</p>
            <p className="font-medium text-gray-900">{analysis.packageManager}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 rounded">
            <Terminal className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Recommended Command</p>
            <code className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
              {analysis.recommendedCommand}
            </code>
          </div>
        </div>
      </div>

      {analysis.availableScripts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Available Scripts:</p>
          <div className="flex flex-wrap gap-2">
            {analysis.availableScripts.map(script => (
              <span
                key={script}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-mono"
              >
                {script}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
