"use client";
import Link from "next/link";
import Image from "next/image";
import { shortName } from "@/lib/text";

type UserCore = {
  id: string;
  name: string;
  username: string | null;
  profileImageUrl: string | null;
};

type Item = {
  id: string;
  user: UserCore;
  subtitle?: string | null;
};

type Props = {
  title: string;
  items: Item[];
  loading?: boolean;
  emptyMessage?: string;
  getProfileHref?: (u: UserCore) => string;
};

export default function UserList({ title, items, loading, emptyMessage, getProfileHref }: Props) {
  return (
    <div className="space-y-3">
      <div className="px-1">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="rounded-2xl ring-1 ring-black/5 bg-white/70 backdrop-blur p-3 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-secondary animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-40 rounded bg-secondary animate-pulse" />
                  <div className="h-2.5 w-24 rounded bg-secondary animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground px-2 py-6 text-center">{emptyMessage || "Nada por aqui."}</div>
        ) : (
          items.map((it) => {
            const u = it.user;
            const href = getProfileHref ? getProfileHref(u) : (u.username ? `/profile/${u.username}` : "#");
            return (
              <Link key={it.id} href={href} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-secondary/70">
                {u.profileImageUrl ? (
                  <Image src={u.profileImageUrl} alt="avatar" width={36} height={36} className="size-9 rounded-full object-cover ring-1 ring-black/5 flex-shrink-0" />
                ) : (
                  <div className="size-9 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold ring-1 ring-black/5 flex-shrink-0">
                    {(u.name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{shortName(u.name)}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.username ? `@${u.username}` : it.subtitle || ""}</div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
