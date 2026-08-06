'use client';

import React, { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon, PlusIcon, MinusIcon, FileIcon } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import rust from 'react-syntax-highlighter/dist/esm/languages/hljs/rust';
import go from 'react-syntax-highlighter/dist/esm/languages/hljs/go';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';

// Register languages
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('json', json);

export interface FileDiff {
  path: string;
  action: 'created' | 'modified' | 'deleted';
  oldContent?: string;
  newContent?: string;
  hunks?: DiffHunk[];
  language?: string;
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'context' | 'addition' | 'deletion';
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
}

export interface FileDiffViewerProps {
  files: FileDiff[];
  renderMode?: 'split' | 'unified';
  className?: string;
}

const getLanguageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    rs: 'rust',
    go: 'go',
    java: 'java',
    css: 'css',
    json: 'json',
  };
  return langMap[ext || ''] || 'text';
};

const FilePathBreadcrumb: React.FC<{ path: string; action: string }> = ({ path, action }) => {
  const parts = path.split('/');
  const fileName = parts.pop();
  const dirPath = parts.join('/');

  const actionStyles = {
    created: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    modified: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    deleted: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {dirPath && (
        <span className="text-gray-400 text-sm font-mono">{dirPath}/</span>
      )}
      <span className="text-white text-sm font-mono font-semibold">{fileName}</span>
      <span className={`px-2 py-0.5 text-xs font-medium border ${actionStyles[action as keyof typeof actionStyles]}`}>
        {action}
      </span>
    </div>
  );
};

const UnifiedDiffView: React.FC<{ file: FileDiff }> = ({ file }) => {
  const language = file.language || getLanguageFromPath(file.path);

  // Simple line-based diff for now (can be enhanced with hunks)
  const renderLineDiff = () => {
    if (!file.oldContent && !file.newContent) return null;

    const oldLines = file.oldContent?.split('\n') || [];
    const newLines = file.newContent?.split('\n') || [];

    // Simple diff visualization (can be improved with proper diff algorithm)
    return (
      <div className="font-mono text-sm">
        {file.action === 'deleted' && oldLines.map((line, idx) => (
          <div key={idx} className="flex">
            <span className="bg-red-900/30 text-red-400 px-3 py-0.5 w-12 text-right select-none">
              {idx + 1}
            </span>
            <span className="bg-red-900/20 px-3 py-0.5 flex-1 border-l-2 border-red-500">
              <span className="text-red-300 mr-2">-</span>
              {line}
            </span>
          </div>
        ))}

        {file.action === 'created' && newLines.map((line, idx) => (
          <div key={idx} className="flex">
            <span className="bg-emerald-900/30 text-emerald-400 px-3 py-0.5 w-12 text-right select-none">
              {idx + 1}
            </span>
            <span className="bg-emerald-900/20 px-3 py-0.5 flex-1 border-l-2 border-emerald-500">
              <span className="text-emerald-300 mr-2">+</span>
              {line}
            </span>
          </div>
        ))}

        {file.action === 'modified' && newLines.map((line, idx) => {
          const isChanged = oldLines[idx] !== line;
          return (
            <div key={idx} className="flex">
              <span className={`px-3 py-0.5 w-12 text-right select-none ${isChanged ? 'bg-sky-900/30 text-sky-400' : 'bg-gray-800/30 text-gray-500'}`}>
                {idx + 1}
              </span>
              <span className={`px-3 py-0.5 flex-1 ${isChanged ? 'bg-sky-900/20 border-l-2 border-sky-500' : ''}`}>
                {isChanged && <span className="text-sky-300 mr-2">~</span>}
                {line}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="border border-gray-700 overflow-hidden">
      {renderLineDiff()}
    </div>
  );
};

const SplitDiffView: React.FC<{ file: FileDiff }> = ({ file }) => {
  const language = file.language || getLanguageFromPath(file.path);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Old/Before */}
      <div className="border border-gray-700 overflow-hidden">
        <div className="bg-red-900/20 border-b border-red-700/30 px-3 py-2 text-xs font-medium text-red-300">
          Before {file.action === 'deleted' && '(deleted)'}
        </div>
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            language={language}
            style={atomOneDark}
            showLineNumbers
            customStyle={{ margin: 0, background: 'transparent', fontSize: '0.75rem' }}
            lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: '#6b7280' }}
          >
            {file.oldContent || ''}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* New/After */}
      <div className="border border-gray-700 overflow-hidden">
        <div className="bg-emerald-900/20 border-b border-emerald-700/30 px-3 py-2 text-xs font-medium text-emerald-300">
          After {file.action === 'created' && '(new)'}
        </div>
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            language={language}
            style={atomOneDark}
            showLineNumbers
            customStyle={{ margin: 0, background: 'transparent', fontSize: '0.75rem' }}
            lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: '#6b7280' }}
          >
            {file.newContent || ''}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export const FileDiffViewer: React.FC<FileDiffViewerProps> = ({
  files,
  renderMode = 'unified',
  className = '',
}) => {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set(files.map(f => f.path)));

  const toggleFile = (path: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFiles(newExpanded);
  };

  const stats = files.reduce(
    (acc, f) => {
      acc[f.action]++;
      return acc;
    },
    { created: 0, modified: 0, deleted: 0 }
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Header */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4 text-emerald-400" />
          <span className="text-emerald-400 font-medium">{stats.created} created</span>
        </div>
        <div className="flex items-center gap-2">
          <FileIcon className="h-4 w-4 text-sky-400" />
          <span className="text-sky-400 font-medium">{stats.modified} modified</span>
        </div>
        <div className="flex items-center gap-2">
          <MinusIcon className="h-4 w-4 text-red-400" />
          <span className="text-red-400 font-medium">{stats.deleted} deleted</span>
        </div>
      </div>

      {/* File Diffs */}
      <div className="space-y-3">
        {files.map((file) => {
          const isExpanded = expandedFiles.has(file.path);

          return (
            <div key={file.path} className="bg-gray-800/40 border border-gray-700/50">
              {/* File Header */}
              <button
                onClick={() => toggleFile(file.path)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700/30 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
                <FilePathBreadcrumb path={file.path} action={file.action} />
              </button>

              {/* Diff Content */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  {renderMode === 'split' ? (
                    <SplitDiffView file={file} />
                  ) : (
                    <UnifiedDiffView file={file} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileDiffViewer;
