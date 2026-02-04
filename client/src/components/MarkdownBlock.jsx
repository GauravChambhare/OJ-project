import React from 'react';
import ReactMarkdown from 'react-markdown';

function MarkdownBlock({ children }) {
  return (
    <div className="markdown-content text-sm text-slate-700 leading-relaxed">
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-slate-900 mt-4 mb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-semibold text-slate-900 mt-3 mb-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-emerald-900 mt-3 mb-1" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-sm font-semibold text-slate-800 mt-2 mb-1" {...props} />,
          p: ({ node, ...props }) => <p className="mb-3 text-slate-700" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 ml-2 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 ml-2 space-y-1" {...props} />,
          li: ({ node, ...props }) => <li className="text-slate-700" {...props} />,
          code({ node, className, children, ...props }) {
            const isInline = !className && typeof children === 'string' && !children.includes('\n');
            return isInline ? (
              <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-slate-100 text-slate-800 p-3 rounded text-sm font-mono overflow-x-auto my-2">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          a: ({ node, ...props }) => <a className="text-indigo-600 hover:underline" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-slate-400 pl-4 italic text-slate-600 my-3" {...props} />
          ),
          hr: ({ node, ...props }) => <hr className="my-4 border-slate-300" {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownBlock;
