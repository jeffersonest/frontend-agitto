"use client";
import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  username?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
};

/**
 * Avatar component with automatic fallback to initials
 * When image fails to load or is not provided, shows user initials
 */
export function UserAvatar({ 
  src, 
  name, 
  username,
  size = "md", 
  className 
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Get initials from name or username
  const getInitials = () => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.trim().substring(0, 2).toUpperCase();
    }
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return "?";
  };

  const initials = getInitials();
  const hasValidSrc = src && !imageError;

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex-shrink-0",
        "bg-gradient-to-br from-primary/20 to-primary/10",
        "text-primary font-semibold",
        "flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      {hasValidSrc ? (
        <Image
          src={src}
          alt={name || username || "User"}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
          sizes={
            size === "xs" ? "24px" :
            size === "sm" ? "32px" :
            size === "md" ? "40px" :
            size === "lg" ? "48px" : "64px"
          }
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

