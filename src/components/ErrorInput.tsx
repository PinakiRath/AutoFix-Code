import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { SampleErrors } from './SampleErrors';

interface ErrorInputProps {
  onSubmitError: (errorLog: string) => void;
  isProcessing: boolean;
}

export function ErrorInput({ onSubmitError, isProcessing }: ErrorInputProps) {
  const [errorLog, setErrorLog] = useState('');

  const handleSubmit = () => {
    if (errorLog.trim()) {
      onSubmitError(errorLog);
    }
  };

  const handleSelectSampleError = (error: string) => {
    setErrorLog(error);
  };

  return (
    <div className="space-y-6">
      <SampleErrors onSelectError={handleSelectSampleError} />
      
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Error Log</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Paste Error Log
            </label>
            <textarea
              value={errorLog}
              onChange={(e) => setErrorLog(e.target.value)}
              placeholder="Paste your build error, runtime error, or test failure logs here..."
              rows={10}
              className="w-full px-4 py-3 border border-gray-600 bg-gray-900 text-gray-100 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400"
              disabled={isProcessing}
            />
            <p className="mt-1 text-xs text-gray-400">
              AI-powered repair using DeepSeek Coder model
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!errorLog.trim() || isProcessing}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Analyzing & Repairing...' : 'Start Auto-Repair'}
          </button>
        </div>
      </div>
    </div>
  );
}
