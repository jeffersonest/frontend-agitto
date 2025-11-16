"use client";

import type { Message } from "@/lib/types/chat";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-end gap-2.5 max-w-[80%]",
        isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-border/50">
          <AvatarImage src={message.sender?.profileImageUrl || undefined} />
          <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary/20 to-primary/10">
            {message.sender?.name?.[0] ||
              message.sender?.username?.[0] ||
              "U"}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex flex-col gap-1">
        <div
          className={cn(
            "px-4 py-3 break-words shadow-md",
            isOwn
              ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-[20px] rounded-br-md"
              : "bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-[20px] rounded-bl-md"
          )}
        >
          <p className="text-[15px] leading-relaxed">{message.content}</p>
        </div>
        <span
          className={cn(
            "text-[11px] text-muted-foreground px-2 font-medium",
            isOwn ? "text-right" : "text-left"
          )}
        >
          {formatTime(message.createdAt)}
        </span>
      </div>
    </motion.div>
  );
}
