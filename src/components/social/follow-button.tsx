"use client";
import { useState } from "react";
import { UserPlus, UserMinus } from "lucide-react";
import { toggleFollow } from "@/lib/api/social";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  userId: string;
  initialIsFollowing: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  onToggle?: (isFollowing: boolean) => void;
};

export default function FollowButton({ userId, initialIsFollowing, variant = "default", size = "default", onToggle }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    if (isLoading) return;

    const prevState = isFollowing;
    setIsFollowing(!prevState);
    setIsLoading(true);

    try {
      const result = await toggleFollow(userId);
      setIsFollowing(result.following);
      onToggle?.(result.following);
      toast.success(result.message);
    } catch (error: unknown) {
      setIsFollowing(prevState);
      const err = error as { message?: string };
      toast.error(err?.message || "Erro ao atualizar");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className="gap-2"
    >
      {isFollowing ? (
        <>
          <UserMinus size={16} />
          <span>Seguindo</span>
        </>
      ) : (
        <>
          <UserPlus size={16} />
          <span>Seguir</span>
        </>
      )}
    </Button>
  );
}
