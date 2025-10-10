"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type Props = {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
};

export default function MarkdownEditor({ value = "", onChange, placeholder }: Props) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange?.(val || "")}
        preview="edit"
        height={300}
        textareaProps={{
          placeholder: placeholder || "Descreva seu evento...",
        }}
      />
    </div>
  );
}
