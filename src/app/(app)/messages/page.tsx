"use client";

import { useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { ChatList } from "@/components/chat/ChatList";
import { NewChatDialog } from "@/components/chat/NewChatDialog";
import { chatConnectionManager } from "@/lib/chat/connection-manager";

export default function MessagesPage() {
  useEffect(() => {
    chatConnectionManager.connect();
    return () => {
      chatConnectionManager.disconnect();
    };
  }, []);

  return (
    <div className="h-[calc(100vh-56px)] flex bg-background -mx-4 md:mx-0">
      <div className="w-full md:w-[400px] flex flex-col md:border-r md:border-l h-full">
        <div className="px-4 py-4 border-b flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Mensagens
          </h1>
          <NewChatDialog />
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatList />
        </div>
      </div>

      <div className="hidden md:flex flex-1 items-center justify-center bg-accent/10">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-semibold">Suas mensagens</p>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione uma conversa para começar
          </p>
        </div>
      </div>
    </div>
  );
}
