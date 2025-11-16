"use client";

import { useEffect, useRef } from "react";
import { useMessages } from "@/lib/queries/chat";
import { MessageBubble } from "./MessageBubble";
import { Loader2 } from "lucide-react";

interface MessageThreadProps {
  chatId: string;
  currentUserId: string;
}

export function MessageThread({ chatId, currentUserId }: MessageThreadProps) {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(chatId);

  const scrollRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (scrollRef.current && data?.pages[0]) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data?.pages[0]?.messages.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const messages = data?.pages.flatMap((page) => page.messages) || [];

  const uniqueMessages = messages.filter((message, index, self) =>
    index === self.findIndex((m) => m.id === message.id)
  );

  const reversedMessages = [...uniqueMessages].reverse();

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-accent/5 via-background to-accent/10"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, hsl(var(--accent) / 0.05) 0%, transparent 50%)
        `
      }}
    >
      {hasNextPage && (
        <div ref={observerTarget} className="flex justify-center py-2">
          {isFetchingNextPage && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
      )}
      {reversedMessages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.senderId === currentUserId}
        />
      ))}
    </div>
  );
}
