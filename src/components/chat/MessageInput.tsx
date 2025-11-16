"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { chatConnectionManager } from "@/lib/chat/connection-manager";

interface MessageInputProps {
  chatId: string;
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ chatId, onSend, disabled }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled) return;

    onSend(content.trim());
    setContent("");
    setIsTyping(false);
    chatConnectionManager.sendTyping(chatId, false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);

    if (e.target.value.trim() && !isTyping) {
      setIsTyping(true);
      chatConnectionManager.sendTyping(chatId, true);
    } else if (!e.target.value.trim() && isTyping) {
      setIsTyping(false);
      chatConnectionManager.sendTyping(chatId, false);
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-5 bg-card/95 backdrop-blur-xl border-t">
        <div className="flex-1 relative group">
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={handleChange}
            placeholder="Digite sua mensagem..."
            disabled={disabled}
            className="w-full pl-5 pr-4 py-3.5 rounded-3xl bg-accent/50 border border-border/50 focus:bg-background focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70 text-[15px]"
          />
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={!content.trim() || disabled}
          className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90 disabled:opacity-50 shadow-lg hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}
