"use client";

import { useRouter } from "next/navigation";
import { useChatStore } from "@/lib/stores/chatStore";
import type { Chat } from "@/lib/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

interface ChatListItemProps {
  chat: Chat;
}

export function ChatListItem({ chat }: ChatListItemProps) {
  const router = useRouter();
  const activeChatId = useChatStore((state) => state.activeChatId);

  const getCurrentUserId = () => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("agitto:accessToken");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();
  const otherUser =
    chat.user1Id === currentUserId ? chat.user2 : chat.user1;

  const isActive = activeChatId === chat.id;

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  return (
    <button
      onClick={() => router.push(`/messages/${chat.id}`)}
      className={cn(
        "flex items-center gap-3.5 px-4 md:px-4 py-4 hover:bg-gradient-to-r hover:from-accent/30 hover:to-accent/10 transition-all border-b w-full text-left group relative",
        isActive && "bg-gradient-to-r from-primary/10 to-primary/5 md:border-l-4 md:border-l-primary"
      )}
    >
      <div className="relative">
        <Avatar className="w-14 h-14 ring-2 ring-border/30 group-hover:ring-primary/30 transition-all shadow-sm">
          <AvatarImage src={otherUser?.profileImageUrl || undefined} />
          <AvatarFallback className="text-base font-semibold bg-gradient-to-br from-primary/15 to-primary/5">
            {otherUser?.name?.[0] || otherUser?.username?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-bold text-[15px] truncate">
            {otherUser?.name || otherUser?.username || "Usuário"}
          </span>
          <span className="text-[11px] text-muted-foreground font-semibold">
            {formatTime(chat.lastMessageAt)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate leading-tight font-medium">
          {chat.lastMessagePreview || "Nova conversa"}
        </p>
      </div>
    </button>
  );
}
