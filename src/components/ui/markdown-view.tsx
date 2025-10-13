"use client";
import dynamic from "next/dynamic";
import "@uiw/react-markdown-preview/markdown.css";

const Markdown = dynamic(async () => (await import("@uiw/react-md-editor")).default.Markdown, { ssr: false });

export default function MarkdownView({ value }: { value?: string }) {
  return (
    <div data-color-mode="light">
      <Markdown source={value || ""} style={{ whiteSpace: "pre-wrap" }} />
    </div>
  );
}

