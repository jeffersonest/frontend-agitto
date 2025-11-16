"use client";

import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { ChatUser } from "@/lib/types/chat";
import { Button } from "../ui/button";

interface ChatHeaderProps {
  otherUser?: ChatUser;
}

export function ChatHeader({ otherUser }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b-2 bg-gradient-to-r from-background via-accent/10 to-background backdrop-blur shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="md:hidden -ml-2 rounded-xl"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <div className="relative">
        <Avatar className="w-12 h-12 ring-2 ring-primary/20 shadow-md">
          <AvatarImage src={otherUser?.profileImageUrl || undefined} />
          <AvatarFallback className="text-base font-semibold bg-gradient-to-br from-primary/20 to-primary/10">
            {otherUser?.name?.[0] || otherUser?.username?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-base truncate">
          {otherUser?.name || otherUser?.username || "Usuário"}
        </p>
        {otherUser?.username && (
          <p className="text-xs text-muted-foreground truncate font-medium">@{otherUser.username}</p>
        )}
      </div>
      <Button variant="ghost" size="icon" asChild className="rounded-xl">
        <Link href="/events">
          <Home className="w-5 h-5" />
        </Link>
      </Button>
    </div>
  );
}
