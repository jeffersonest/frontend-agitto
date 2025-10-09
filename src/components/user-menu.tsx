"use client";
import { useEffect, useRef, useState } from "react";
import { getMe } from "@/lib/api/auth";
import { logout } from "@/lib/auth/logout";
import { cn } from "@/lib/utils";

type Me = { name?: string; email?: string; avatarUrl?: string } | null;

export default function UserMenu() {
  const [me, setMe] = useState<Me>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMe().then((data: any) => setMe(data ?? null)).catch(() => setMe(null));
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const initial = (me?.name || me?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-secondary transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="size-8 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold">
          {me?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={me.avatarUrl} alt="avatar" className="size-8 rounded-full object-cover" />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div className="hidden sm:block text-left leading-tight">
          <div className="text-sm font-medium text-foreground">{me?.name || "Usuário"}</div>
          <div className="text-xs text-muted-foreground max-w-[180px] truncate">{me?.email}</div>
        </div>
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 mt-2 w-56 rounded-lg border bg-background shadow-md p-1",
            "z-50"
          )}
        >
          <div className="px-3 py-2">
            <div className="text-sm font-medium">{me?.name || "Usuário"}</div>
            <div className="text-xs text-muted-foreground truncate">{me?.email}</div>
          </div>
          <hr className="my-1 border-border" />
          <a href="/events" className="block rounded-md px-3 py-2 text-sm hover:bg-secondary">Eventos</a>
          <a href="/_settings" className="block rounded-md px-3 py-2 text-sm hover:bg-secondary">Configurações</a>
          <button onClick={() => logout()} className="block w-full text-left rounded-md px-3 py-2 text-sm hover:bg-secondary text-destructive">
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

