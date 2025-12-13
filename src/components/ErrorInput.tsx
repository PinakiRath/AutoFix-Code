import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface ErrorInputProps {
  onSubmitError: (errorLog: string, apiKey: string) => void;
  isProcessing: boolean;
}

export function ErrorInput({ onSubmitError, isProcessing }: ErrorInputProps) {
  const [errorLog, setErrorLog] = useState('');
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = () => {
    if (errorLog.trim() && apiKey.trim()) {
      onSubmitError(errorLog, apiKey);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900">Error Log</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OpenAI API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isProcessing}
          />
          <p className="mt-1 text-xs text-gray-500">
            Your API key is used only for this repair session and never stored
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste Error Log
          </label>
          <textarea
            value={errorLog}
            onChange={(e) => setErrorLog(e.target.value)}
            placeholder="Paste your build error, runtime error, or test failure logs here..."
            rows={10}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isProcessing}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!errorLog.trim() || !apiKey.trim() || isProcessing}
          className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Analyzing & Repairing...' : 'Start Auto-Repair'}
        </button>
      </div>
    </div>
  );
}
