import { Code, Copy } from 'lucide-react';

interface SampleErrorsProps {
  onSelectError: (error: string) => void;
}

const SAMPLE_ERRORS = [
  {
    title: 'TypeScript Type Error',
    error: `src/components/Button.tsx:15:7 - error TS2322: Type 'string' is not assignable to type 'number'.

15   const count: number = "hello";
         ~~~~~

Found 1 error in src/components/Button.tsx:15`
  },
  {
    title: 'React Hook Error',
    error: `Error: Invalid hook call. Hooks can only be called inside the body of a function component.
    at resolveDispatcher (/node_modules/react/cjs/react.development.js:1476:13)
    at useState (/node_modules/react/cjs/react.development.js:1507:20)
    at MyComponent (/src/components/MyComponent.tsx:8:18)`
  },
  {
    title: 'Import/Export Error',
    error: `Module not found: Error: Can't resolve './utils' in '/src/components'
Did you mean './utils.ts'?
BREAKING CHANGE: The request './utils' failed to resolve only because it was resolved as fully specified`
  },
  {
    title: 'Vite Build Error',
    error: `[vite]: Rollup failed to resolve import "react-dom/client" from "src/main.tsx".
This is most likely unintended because it can break your application at runtime.
If you do want to externalize this module explicitly add it to
\`build.rollupOptions.external\``
  }
];

export function SampleErrors({ onSelectError }: SampleErrorsProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Sample Errors</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Try these common errors to test the AI repair functionality:
      </p>
      
      <div className="grid gap-3">
        {SAMPLE_ERRORS.map((sample, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 text-sm">{sample.title}</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(sample.error)}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSelectError(sample.error)}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  Use This Error
                </button>
              </div>
            </div>
            <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
              {sample.error.length > 150 ? sample.error.substring(0, 150) + '...' : sample.error}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}