"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useChat, useSendMessage } from "@/lib/queries/chat";
import { useChatStore } from "@/lib/stores/chatStore";
import { chatConnectionManager } from "@/lib/chat/connection-manager";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageThread } from "@/components/chat/MessageThread";
import { MessageInput } from "@/components/chat/MessageInput";
import { ChatList } from "@/components/chat/ChatList";
import { Loader2, MessageSquare } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Message, MessagesResponse } from "@/lib/types/chat";

interface InfiniteMessagesData {
  pages: MessagesResponse[];
  pageParams: (string | undefined)[];
}

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const queryClient = useQueryClient();
  const { data: chat, isLoading } = useChat(chatId);
  const sendMessage = useSendMessage(chatId);
  const setActiveChatId = useChatStore((state) => state.setActiveChatId);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    chatConnectionManager.connect();
    return () => {
      chatConnectionManager.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("agitto:accessToken");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setCurrentUserId(payload.sub);
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (chatId) {
      setActiveChatId(chatId);
      chatConnectionManager.joinChat(chatId);
    }

    return () => {
      chatConnectionManager.leaveChat(chatId);
      setActiveChatId(null);
    };
  }, [chatId, setActiveChatId]);

  useEffect(() => {
    const cleanup = chatConnectionManager.onMessage((message: Message) => {
      if (message.chatId === chatId) {
        queryClient.setQueryData<InfiniteMessagesData>(
          ["messages", chatId],
          (old) => {
            if (!old?.pages) return old;
            const pages = [...old.pages];
            if (pages[0]) {
              const existingIds = new Set(pages[0].messages.map((m: Message) => m.id));
              if (!existingIds.has(message.id)) {
                pages[0] = {
                  ...pages[0],
                  messages: [message, ...pages[0].messages],
                };
              }
            }
            return { ...old, pages };
          }
        );
      }
    });

    return cleanup;
  }, [chatId, queryClient]);

  if (isLoading || !currentUserId) {
    return (
      <div className="h-[calc(100vh-56px)] flex bg-background -mx-4 md:mx-0">
        <div className="hidden md:flex md:w-[400px] flex-col md:border-r md:border-l h-full">
          <div className="px-4 py-4 border-b flex-shrink-0">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Mensagens
            </h1>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatList />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center md:border-r">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="h-[calc(100vh-56px)] flex items-center justify-center -mx-4 md:mx-0">
        <p className="text-muted-foreground">Conversa não encontrada</p>
      </div>
    );
  }

  const otherUser = chat.user1Id === currentUserId ? chat.user2 : chat.user1;

  return (
    <div className="h-[calc(100vh-56px)] flex bg-background -mx-4 md:mx-0">
      <div className="hidden md:flex md:w-[400px] flex-col md:border-r md:border-l h-full">
        <div className="px-4 py-4 border-b flex-shrink-0">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Mensagens
          </h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatList />
        </div>
      </div>

      <div className="flex-1 flex flex-col md:border-r h-full">
        <ChatHeader otherUser={otherUser} />
        <MessageThread chatId={chatId} currentUserId={currentUserId} />
        <MessageInput
          chatId={chatId}
          onSend={(content) => sendMessage.mutate(content)}
          disabled={sendMessage.isPending}
        />
      </div>
    </div>
  );
}
