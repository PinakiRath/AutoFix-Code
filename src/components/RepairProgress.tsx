import { CheckCircle2, XCircle, Loader2, FileEdit } from 'lucide-react';
import { RepairAttempt } from '../types';

interface RepairProgressProps {
  attempts: RepairAttempt[];
  currentIteration: number;
  maxIterations: number;
}

export function RepairProgress({ attempts, currentIteration, maxIterations }: RepairProgressProps) {
  if (attempts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Repair Progress</h3>
        <span className="text-sm text-gray-600">
          Iteration {currentIteration} of {maxIterations}
        </span>
      </div>

      <div className="space-y-4">
        {attempts.map((attempt, index) => (
          <div
            key={attempt.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {attempt.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : index === attempts.length - 1 && currentIteration === attempt.iteration ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    Iteration {attempt.iteration}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {attempt.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {attempt.fixes.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <FileEdit className="w-4 h-4" />
                      <span>Files Modified: {attempt.fixes.length}</span>
                    </div>
                    <div className="space-y-1">
                      {attempt.fixes.map((fix, fixIndex) => (
                        <div
                          key={fixIndex}
                          className="text-xs bg-gray-50 rounded p-2"
                        >
                          <p className="font-mono text-gray-900 mb-1">{fix.path}</p>
                          <p className="text-gray-600">{fix.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {attempt.errorLog && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                      View Error Log
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                      {attempt.errorLog}
                    </pre>
                  </details>
                )}

                {attempt.success && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Repair Successful</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
