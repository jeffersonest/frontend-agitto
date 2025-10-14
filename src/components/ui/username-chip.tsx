"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  username: string;
  href?: string;
  variant?: "white" | "tint";
  size?: "xs" | "sm";
  mode?: "link" | "button";
  className?: string;
};

export default function UsernameChip({ username, href, variant = "white", size = "sm", mode = "link", className }: Props) {
  const router = useRouter();
  const to = href || `/profile/${username}`;
  const base = cn(
    "inline-flex items-center gap-1 rounded-full cursor-pointer ring-1 ring-black/5 hover:ring-primary/30 hover:underline transition-colors",
    variant === "white" && "bg-white/90 text-foreground hover:bg-white hover:text-primary",
    variant === "tint" && "bg-primary/10 text-primary hover:bg-white hover:text-primary",
    size === "sm" && "px-3 py-1 text-xs",
    size === "xs" && "px-2 py-0.5 text-[11px]",
    className,
  );

  if (mode === "button") {
    return (
      <button
        type="button"
        className={base}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push(to);
        }}
        title={`@${username}`}
      >
        <span className="truncate">@{username}</span>
      </button>
    );
  }

  return (
    <Link href={to} className={base} title={`@${username}`}>
      <span className="truncate">@{username}</span>
    </Link>
  );
}

