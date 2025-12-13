import { Download, FileCheck } from 'lucide-react';
import { FileFix } from '../types';
import { downloadFile } from '../lib/fileSystem';

interface FixedFilesProps {
  fixes: FileFix[];
}

export function FixedFiles({ fixes }: FixedFilesProps) {
  if (fixes.length === 0) {
    return null;
  }

  const handleDownload = (fix: FileFix) => {
    const filename = fix.path.split('/').pop() || 'fixed-file.txt';
    downloadFile(filename, fix.content);
  };

  const handleDownloadAll = () => {
    fixes.forEach(fix => {
      setTimeout(() => handleDownload(fix), 100);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Fixed Files</h3>
        </div>
        <button
          onClick={handleDownloadAll}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download All
        </button>
      </div>

      <div className="space-y-3">
        {fixes.map((fix, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-gray-900 mb-1">{fix.path}</p>
                <p className="text-sm text-gray-600">{fix.reason}</p>
              </div>
              <button
                onClick={() => handleDownload(fix)}
                className="flex-shrink-0 p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <details className="mt-3">
              <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                View Fixed Code
              </summary>
              <pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto max-h-96">
                {fix.content}
              </pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
