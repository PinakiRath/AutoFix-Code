import { useState } from 'react';
import { ChevronDown, ChevronRight, Download, Copy, Check } from 'lucide-react';

interface CodeDiffProps {
  filePath: string;
  oldContent: string;
  newContent: string;
  explanation?: string;
}

export function CodeDiff({ filePath, oldContent, newContent, explanation }: CodeDiffProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([newContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath.split('/').pop() || 'fixed-file.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLineDiff = () => {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const maxLines = Math.max(oldLines.length, newLines.length);
    
    const diff = [];
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';
      
      if (oldLine !== newLine) {
        if (oldLine && newLine) {
          diff.push({ type: 'modified', lineNum: i + 1, oldLine, newLine });
        } else if (oldLine) {
          diff.push({ type: 'removed', lineNum: i + 1, oldLine, newLine: '' });
        } else {
          diff.push({ type: 'added', lineNum: i + 1, oldLine: '', newLine });
        }
      } else if (oldLine) {
        diff.push({ type: 'unchanged', lineNum: i + 1, oldLine, newLine });
      }
    }
    
    return diff;
  };

  const lineDiff = getLineDiff();
  const hasChanges = lineDiff.some(line => line.type !== 'unchanged');

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div 
        className="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className="font-mono text-sm font-medium text-gray-900">{filePath}</span>
          {hasChanges && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Modified
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(newContent);
            }}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="Copy fixed code"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadFile();
            }}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="Download fixed file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200">
          {explanation && (
            <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
              <p className="text-sm text-blue-800">
                <strong>Fix:</strong> {explanation}
              </p>
            </div>
          )}
          
          <div className="max-h-96 overflow-y-auto">
            <div className="font-mono text-sm">
              {lineDiff.map((line, index) => (
                <div
                  key={index}
                  className={`flex ${
                    line.type === 'added' ? 'bg-green-50' :
                    line.type === 'removed' ? 'bg-red-50' :
                    line.type === 'modified' ? 'bg-yellow-50' :
                    'bg-white'
                  }`}
                >
                  <div className="w-12 px-2 py-1 text-gray-500 text-right border-r border-gray-200 bg-gray-50">
                    {line.lineNum}
                  </div>
                  <div className="flex-1 px-3 py-1">
                    {line.type === 'removed' && (
                      <div className="text-red-700">- {line.oldLine}</div>
                    )}
                    {line.type === 'added' && (
                      <div className="text-green-700">+ {line.newLine}</div>
                    )}
                    {line.type === 'modified' && (
                      <>
                        <div className="text-red-700">- {line.oldLine}</div>
                        <div className="text-green-700">+ {line.newLine}</div>
                      </>
                    )}
                    {line.type === 'unchanged' && (
                      <div className="text-gray-700">{line.oldLine}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}