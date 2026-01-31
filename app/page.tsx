'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Copy, Check, Download, RotateCcw } from 'lucide-react';

const FRAMEWORKS = ['Vitest', 'Jest', 'React Testing Library'] as const;
type Framework = typeof FRAMEWORKS[number];

const EXAMPLES = [
  {
    title: 'Simple function',
    code: `function sum(a: number, b: number): number {
  return a + b;
}

function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}`
  },
  {
    title: 'Email validator',
    code: `function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}`
  },
  {
    title: 'Array handler',
    code: `function removeDuplicates<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const group = String(item[key]);
    acc[group] = acc[group] || [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}`
  }
];

function extractCode(text: string): string {
  const match = text.match(/```(?:typescript|ts|javascript|js)?\n([\s\S]*?)```/);
  return match ? match[1].trim() : text;
}

export default function Chat() {
  const [code, setCode] = useState('');
  const [framework, setFramework] = useState<Framework>('Vitest');
  const [copied, setCopied] = useState(false);
  const { messages, sendMessage, regenerate, status } = useChat();

  const lastResponse = [...messages].reverse().find(m => m.role === 'assistant');
  const generatedCode = lastResponse
    ? extractCode(lastResponse.parts.filter(p => p.type === 'text').map(p => p.text).join(''))
    : '';

  const handleGenerate = () => {
    if (!code.trim() || status !== 'ready') return;
    sendMessage({
      text: `Framework: ${framework}\n\nCode:\n\`\`\`\n${code}\n\`\`\`\n\nGenerate complete tests for this code.`
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extension = framework === 'Jest' || framework === 'Vitest' ? '.test.ts' : '.spec.tsx';
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tests${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <div className="border-b border-zinc-800 px-4 md:px-6 py-3 md:py-4 shrink-0">
        <h1 className="text-lg md:text-xl font-semibold text-zinc-100">⚡ Test Generator</h1>
        <p className="text-xs md:text-sm text-zinc-500 mt-0.5">Paste your code and generate automated tests</p>
      </div>

      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        <div className="w-full md:w-1/2 flex flex-col md:border-r border-zinc-800 border-b md:border-b-0">
          <div className="flex flex-wrap items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 border-b border-zinc-800 bg-zinc-900 shrink-0">
            <span className="text-xs text-zinc-500">Framework:</span>
            <div className="flex gap-1 flex-wrap">
              {FRAMEWORKS.map(fw => (
                <button
                  key={fw}
                  onClick={() => setFramework(fw)}
                  className={`px-2 md:px-3 py-1 rounded text-xs font-medium transition-colors ${framework === fw
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                >
                  {fw}
                </button>
              ))}
            </div>

            <div className="ml-auto">
              <select
                onChange={(e) => {
                  const example = EXAMPLES.find(ex => ex.title === e.target.value);
                  if (example) setCode(example.code);
                }}
                className="bg-zinc-800 text-zinc-300 text-xs px-2 md:px-3 py-1 rounded border border-zinc-700 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Examples...</option>
                {EXAMPLES.map(ex => (
                  <option key={ex.title} value={ex.title}>{ex.title}</option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            className="w-full bg-zinc-950 text-zinc-200 text-sm font-mono p-3 md:p-4 resize-none outline-none placeholder-zinc-600"
            style={{ minHeight: '200px', flex: '1 1 auto' }}
            spellCheck={false}
          />

          <div className="p-3 md:p-4 border-t border-zinc-800 bg-zinc-900 shrink-0">
            <button
              onClick={handleGenerate}
              disabled={!code.trim() || status === 'streaming' || status === 'submitted'}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {status === 'streaming' || status === 'submitted' ? 'Generating...' : 'Generate Tests'}
            </button>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col min-h-0">
          {generatedCode && (
            <div className="flex items-center justify-between px-3 md:px-4 py-2 border-b border-zinc-800 bg-zinc-900 shrink-0">
              <span className="text-xs text-zinc-500">Generated tests</span>
              <div className="flex gap-2">
                <button
                  onClick={() => regenerate()}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Regenerate"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={handleCopy}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Copy"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={handleDownload}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Download"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto p-3 md:p-4" style={{ minHeight: '200px' }}>
            {(status === 'submitted' || status === 'streaming') && !generatedCode && (
              <div className="flex items-center gap-2 text-zinc-600 text-sm mt-8 justify-center">
                <div className="w-4 h-4 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
                Generating tests...
              </div>
            )}

            {generatedCode ? (
              <pre className="text-sm font-mono text-zinc-300 whitespace-pre-wrap">{generatedCode}</pre>
            ) : (
              status === 'ready' && (
                <div className="text-zinc-600 text-sm text-center mt-16">
                  <p className="text-lg mb-2">👆</p>
                  <p>Paste your code in the left panel</p>
                  <p>and click "Generate Tests"</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}