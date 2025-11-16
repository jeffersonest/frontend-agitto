"use client";
import Link from "next/link";
import { useEffect } from "react";
import UserMenu from "@/components/user-menu";
import { Logo } from "@/components/ui/logo";
import { MessageSquare, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listActiveNotifications } from "@/lib/api/notifications";

export default function AppHeader() {
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ["notifications", "active"],
    queryFn: listActiveNotifications,
    refetchInterval: 10000,
  });

  const unreadCount = notifications?.length || 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-backdrop-blur:bg-background/60">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/events" className="flex items-center">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/messages">
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
