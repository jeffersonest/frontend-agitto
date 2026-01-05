"use client";
import Link from "next/link";
import FollowButton from "./follow-button";
import { Users } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { fixImageUrl } from "@/lib/utils/image-url";

type User = {
  id: string;
  name: string;
  username: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
};

type Props = {
  user: User;
  showFollowButton?: boolean;
  onFollowToggle?: (userId: string, isFollowing: boolean) => void;
};

export default function UserCard({ user, showFollowButton = true, onFollowToggle }: Props) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-white border hover:shadow-sm transition-shadow">
      <Link href={`/profile/${user.username}`} className="shrink-0">
        <UserAvatar
          src={fixImageUrl(user.profileImageUrl)}
          name={user.name}
          username={user.username || undefined}
          size="lg"
        />
      </Link>

      <Link href={`/profile/${user.username}`} className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{user.name}</div>
        {user.username && (
          <div className="text-xs text-muted-foreground">@{user.username}</div>
        )}
        {user.bio && (
          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{user.bio}</div>
        )}
        {(user.followersCount !== undefined || user.followingCount !== undefined) && (
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {user.followersCount !== undefined && (
              <span className="flex items-center gap-1">
                <Users size={12} />
                {user.followersCount} seguidores
              </span>
            )}
            {user.followingCount !== undefined && (
              <span>{user.followingCount} seguindo</span>
            )}
          </div>
        )}
      </Link>

      {showFollowButton && user.isFollowing !== undefined && (
        <FollowButton
          userId={user.id}
          initialIsFollowing={user.isFollowing}
          variant="outline"
          size="sm"
          onToggle={(isFollowing) => onFollowToggle?.(user.id, isFollowing)}
        />
      )}
    </div>
  );
}
