/** @format */
"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import "quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-white rounded-xl flex items-center justify-center">
      <div className="text-gray-500">Loading editor...</div>
    </div>
  ),
});

interface QuillEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

export default function QuillEditor({
  content,
  onChange,
  editable = true,
}: QuillEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ color: [] }, { background: [] }],
          ["link", "image", "code-block"],
          ["clean"],
        ],
      },
      clipboard: {
        matchVisual: true,
      },
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
    "code-block",
    "color",
    "background",
  ];

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
      <style jsx global>{`
        .quill {
          background-color: #0f172a !important;
          border-color: #334155 !important;
        }
        .ql-toolbar {
          background-color: #1e293b !important;
          border-color: #334155 !important;
        }
        .ql-stroke {
          stroke: #94a3b8 !important;
        }
        .ql-fill {
          fill: #94a3b8 !important;
        }
        .ql-container {
          background-color: #0f172a !important;
          border-color: #334155 !important;
          color: #f1f5f9 !important;
          font-size: 16px;
        }
        .ql-editor {
          background-color: #0f172a !important;
          color: #f1f5f9 !important;
          min-height: 400px;
        }
        .ql-editor.ql-blank::before {
          color: #64748b !important;
        }
        .ql-editor p {
          color: #f1f5f9 !important;
          line-height: 1.6;
        }
        .ql-editor h1,
        .ql-editor h2,
        .ql-editor h3 {
          color: #f1f5f9 !important;
        }
        .ql-editor a {
          color: #00aeeff !important;
        }
        .ql-editor ul,
        .ql-editor ol {
          color: #f1f5f9 !important;
        }
        .ql-editor blockquote {
          border-left-color: #475569 !important;
          color: #94a3b8 !important;
        }
        .ql-editor pre {
          background-color: #1e293b !important;
          color: #f1f5f9 !important;
        }
        .ql-editor code {
          background-color: #1e293b !important;
          color: #f1f5f9 !important;
        }
        .ql-toolbar button:hover,
        .ql-toolbar button.ql-active {
          background-color: #334155 !important;
        }
        .ql-toolbar .ql-picker-label:hover,
        .ql-toolbar .ql-picker-label.ql-active {
          background-color: #334155 !important;
        }
        .ql-toolbar .ql-picker-options {
          background-color: #1e293b !important;
          border-color: #334155 !important;
        }
        .ql-toolbar .ql-picker-item {
          color: #f1f5f9 !important;
        }
        .ql-toolbar .ql-picker-item:hover {
          background-color: #334155 !important;
        }
        .ql-toolbar .ql-picker-item.ql-selected {
          background-color: #C10302 !important;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={content}
        onChange={onChange}
        modules={modules}
        formats={formats}
        readOnly={!editable}
        placeholder="Start writing your article content..."
      />
    </div>
  );
}
