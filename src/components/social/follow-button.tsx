"use client";
import { useState, useEffect } from "react";
import { UserPlus, UserMinus } from "lucide-react";
import { toggleFollow } from "@/lib/api/social";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  userId: string;
  initialIsFollowing: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  onToggle?: (isFollowing: boolean) => void;
  username?: string;
};

export default function FollowButton({ userId, initialIsFollowing, variant = "default", size = "default", onToggle, username }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  async function handleToggle() {
    if (isLoading) return;

    const prevState = isFollowing;
    const newState = !prevState;
    setIsFollowing(newState);
    setIsLoading(true);

    if (username) {
      type ProfileData = { user: { id: string; name: string; username: string; bio?: string | null; profileImageUrl?: string | null }; stats?: unknown; isFollowing?: boolean } | undefined;
      queryClient.setQueryData<ProfileData>(["user", "profile", username], (old) => {
        if (!old) return old;
        return { ...old, isFollowing: newState } as ProfileData;
      });
    }

    try {
      const result = await toggleFollow(userId);
      setIsFollowing(result.following);
      onToggle?.(result.following);
      toast.success(result.message);

      if (username) {
        await queryClient.invalidateQueries({ queryKey: ["user", "profile", username] });
      }

      await queryClient.invalidateQueries({ queryKey: ["user", "followers"] });
      await queryClient.invalidateQueries({ queryKey: ["user", "following"] });
    } catch (error: unknown) {
      setIsFollowing(prevState);

      if (username) {
        type ProfileData = { user: { id: string; name: string; username: string; bio?: string | null; profileImageUrl?: string | null }; stats?: unknown; isFollowing?: boolean } | undefined;
        queryClient.setQueryData<ProfileData>(["user", "profile", username], (old) => {
          if (!old) return old;
          return { ...old, isFollowing: prevState } as ProfileData;
        });
      }

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
