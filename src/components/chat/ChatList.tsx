"use client";

import { useChats } from "@/lib/queries/chat";
import { ChatListItem } from "./ChatListItem";
import { Loader2 } from "lucide-react";

export function ChatList() {
  const { data: chats, isLoading } = useChats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <p className="text-sm text-muted-foreground">Nenhuma conversa ainda</p>
        <p className="text-xs text-muted-foreground mt-1">
          Comece uma conversa com alguém que você segue
        </p>
      </div>
    );
  }

  const sortedChats = [...chats].sort((a, b) => {
    const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="flex flex-col overflow-y-auto h-full">
      {sortedChats.map((chat) => (
        <ChatListItem key={chat.id} chat={chat} />
      ))}
    </div>
  );
}
