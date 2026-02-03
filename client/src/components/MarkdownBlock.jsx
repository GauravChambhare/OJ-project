import React from "react";
import ReactMarkdown from "react-markdown";

function MarkdownBlock({ children }) {
  return (
    <div className="text-sm text-slate-700 leading-relaxed">
      <ReactMarkdown>{children || ""}</ReactMarkdown>
    </div>
  );
}

export default MarkdownBlock;