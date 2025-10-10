"use client";
import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Heading1, Heading2, Quote, Code } from "lucide-react";

type Props = {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
};

export default function RichTextarea({ value = "", onChange, placeholder }: Props) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  function insert(snippet: string, cursorOffset = 0) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const next = `${before}${snippet}${after}`;
    onChange?.(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length + cursorOffset;
      el.setSelectionRange(pos, pos);
    });
  }

  const toolbar = [
    { icon: Bold, label: "Negrito", action: () => insert("**texto**", -6) },
    { icon: Italic, label: "Itálico", action: () => insert("*texto*", -5) },
    { icon: Heading1, label: "Título 1", action: () => insert("# Título\n", 0) },
    { icon: Heading2, label: "Título 2", action: () => insert("## Título\n", 0) },
    { icon: List, label: "Lista", action: () => insert("- Item\n", 0) },
    { icon: ListOrdered, label: "Lista numerada", action: () => insert("1. Item\n", 0) },
    { icon: LinkIcon, label: "Link", action: () => insert("[texto](https://exemplo.com)", -1) },
    { icon: Quote, label: "Citação", action: () => insert("> Citação\n", 0) },
    { icon: Code, label: "Código", action: () => insert("`código`", -5) },
  ];

  return (
    <div className="space-y-2 border rounded-lg p-2 bg-background">
      <div className="flex flex-wrap gap-1 pb-2 border-b">
        {toolbar.map((item, i) => (
          <button
            key={i}
            type="button"
            title={item.label}
            className="p-1.5 rounded hover:bg-secondary transition-colors"
            onClick={item.action}
          >
            <item.icon size={16} />
          </button>
        ))}
      </div>
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
        rows={10}
      />
      <div className="text-xs text-muted-foreground pt-2 border-t">
        Suporta Markdown: negrito (**texto**), itálico (*texto*), títulos (#), listas (- ou 1.), links, citações (>), código (`)
      </div>
    </div>
  );
}

