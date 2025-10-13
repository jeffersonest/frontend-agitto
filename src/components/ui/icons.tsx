"use client";
import { cn } from "@/lib/utils";

type IconProps = { size?: number; className?: string; active?: boolean };

export function IconLike({ size = 16, className, active }: IconProps) {
  const fill = active ? "currentColor" : "none";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(active ? "text-rose-600" : "text-foreground", className)}
    >
      <path
        d="M12.001 4.529c2.349-2.356 6.155-2.356 8.504 0 2.349 2.356 2.349 6.175 0 8.531l-6.657 6.676a2.6 2.6 0 0 1-3.69 0L3.5 13.06c-2.349-2.356-2.349-6.175 0-8.531 2.349-2.356 6.155-2.356 8.504 0l-.003 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconInterest({ size = 16, className, active }: IconProps) {
  // Stylized star/marker
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(active ? "text-purple-700" : "text-foreground", className)}
    >
      <path
        d="M12 2l2.6 5.27L20.5 8.5l-4 4.02.95 5.6L12 15.9 6.55 18.1 7.5 13.5l-4-4 5.9-1.23L12 2Z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconGoing({ size = 16, className, active }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(active ? "text-[color:var(--primary)]" : "text-foreground", className)}
    >
      <circle cx="12" cy="12" r="9" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" stroke={active ? "#fff" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

