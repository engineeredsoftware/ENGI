import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  vscDarkPlus,
  atomDark,
  dracula,
  duotoneDark,
  oneDark
} from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language?: string;
  children: string | string[];
  className?: string;
  style?: React.CSSProperties;
}

const theme = oneDark;

const CodeBlock: React.FC<CodeBlockProps> = ({
  language = 'text',
  children,
  className,
  style
}) => {
  // Extract language from className if provided (format: language-xxx)
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : language;

  // Handle case where children is an array
  const code = Array.isArray(children) ? children.join('') : children;

  return (
    <div className="relative group rounded-md overflow-hidden my-4">
      {/* Language badge */}
      {lang !== 'text' && (
        <div className="absolute top-2 right-2 text-xs bg-black/50 text-gray-300 px-2 py-0.5 rounded font-mono opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {lang}
        </div>
      )}

      <SyntaxHighlighter
        language={lang}
        style={theme}
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          ...style
        }}
        wrapLongLines={false}
        showLineNumbers={lang !== 'text' && code.split('\n').length > 5}
        lineNumberStyle={{
          minWidth: '2.5em',
          paddingRight: '1em',
          color: 'rgba(156, 163, 175, 0.5)',
          textAlign: 'right',
          userSelect: 'none'
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;

