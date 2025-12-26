"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { getMe } from "@/lib/api/auth";
import { logout } from "@/lib/auth/logout";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { type Notification } from "@/lib/api/notifications";
import { useActiveNotifications, useReadNotifications, useMarkNotificationRead, useCompleteNotification, useMarkAllNotificationsRead, notificationKeys } from "@/lib/queries/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { formatRelativeTime } from "@/lib/date";
import { requestEmailCode } from "@/lib/api/auth";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";
import Image from "next/image";
import { shortName } from "@/lib/text";
import { fixImageUrl } from "@/lib/utils/image-url";

type Me = { name?: string; email?: string; avatarUrl?: string } | null;

export default function UserMenu() {
  const [me, setMe] = useState<Me>(null);
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [eventOnly, setEventOnly] = useState(false);
  const qc = useQueryClient();
  const { data: active = [] as Notification[] } = useActiveNotifications();
  const { data: read = [] as Notification[] } = useReadNotifications();
  const markRead = useMarkNotificationRead();
  const complete = useCompleteNotification();
  const markAll = useMarkAllNotificationsRead();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  type MeResp = { name?: string; email?: string; avatarUrl?: string; profileImageUrl?: string; username?: string };
  useEffect(() => {
    getMe()
      .then((data) => {
        const resp = data as MeResp;
        setMe({
          name: resp.name,
          email: resp.email,
          avatarUrl: fixImageUrl(resp.profileImageUrl || resp.avatarUrl),
        });
      })
      .catch(() => setMe(null));
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

  useEffect(() => {
    if (!notifOpen) return;
    qc.invalidateQueries({ queryKey: notificationKeys.active() });
  }, [notifOpen, qc]);

  const visibleNotifications = useMemo(() => {
    if (!eventOnly) return active;
    const eventTypes = new Set([
      "EVENT_TODAY",
      "EVENT_TOMORROW",
      "EVENT_INTEREST_TOMORROW",
      "EVENT_CANCELLED",
      "EVENT_DATE_CHANGED",
      "EVENT_LOCATION_CHANGED",
    ] as const);
    return active.filter((n) => eventTypes.has(n.type as typeof eventTypes extends Set<infer T> ? T : never));
  }, [active, eventOnly]);

  const lastTsRef = useRef<number>(0);
  useEffect(() => {
    // initialize last seen timestamp from storage
    if (lastTsRef.current === 0) {
      const raw = typeof window !== "undefined" ? localStorage.getItem("agitto:lastNotifTs") : null;
      if (raw) lastTsRef.current = Number(raw) || 0;
      if (!raw && active.length > 0) {
        const maxTs = Math.max(...active.map((n) => new Date(n.createdAt).getTime()));
        lastTsRef.current = maxTs;
        try { localStorage.setItem("agitto:lastNotifTs", String(maxTs)); } catch {}
      }
    }
    const eventTypes = new Set(["EVENT_TODAY", "EVENT_TOMORROW", "EVENT_INTEREST_TOMORROW", "EVENT_CANCELLED", "EVENT_DATE_CHANGED", "EVENT_LOCATION_CHANGED"]);
    const nowList = active.filter((n) => eventTypes.has(n.type) && new Date(n.createdAt).getTime() > lastTsRef.current);
    if (nowList.length > 0) {
      // show only the latest to avoid noise
      const newest = nowList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      toast.info(newest.title, {
        description: newest.message,
        action: newest.actionUrl ? {
          label: "Ver evento",
          onClick: () => {
            router.push(newest.actionUrl as string);
          },
        } : undefined,
      });
      const maxTs = Math.max(lastTsRef.current, ...active.map((n) => new Date(n.createdAt).getTime()));
      lastTsRef.current = maxTs;
      try { localStorage.setItem("agitto:lastNotifTs", String(maxTs)); } catch {}
    }
  }, [active, router]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-secondary transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="size-8 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold relative flex-shrink-0">
          {active.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-semibold grid place-items-center ring-2 ring-background">
              {active.length > 9 ? "9+" : String(active.length)}
            </span>
          )}
          {((me as unknown as MeResp)?.profileImageUrl && (me as unknown as MeResp)?.profileImageUrl !== "") ||
           (me?.avatarUrl && me?.avatarUrl !== "") ? (
            <Image
              src={(me as unknown as MeResp)?.profileImageUrl || me?.avatarUrl || ""}
              alt="avatar"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div className="hidden sm:block text-left leading-tight">
          <div className="text-sm font-medium text-foreground">{shortName(me?.name || "Usuário")}</div>
          <div className="text-xs text-muted-foreground max-w-[180px] truncate">{(me as unknown as MeResp)?.username ? `@${(me as unknown as MeResp).username}` : me?.email}</div>
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
            <div className="text-xs text-muted-foreground truncate">{(me as unknown as MeResp)?.username ? `@${(me as unknown as MeResp).username}` : me?.email}</div>
          </div>
          <hr className="my-1 border-border" />
          <Link href="/events" className="block rounded-md px-3 py-2 text-sm hover:bg-secondary">Eventos</Link>
          <Link href="/my-events" className="block rounded-md px-3 py-2 text-sm hover:bg-secondary">Meus eventos</Link>
          <Link href="/followers" className="block rounded-md px-3 py-2 text-sm hover:bg-secondary">Seguidores</Link>
          <button onClick={() => setNotifOpen(true)} className="block w-full text-left rounded-md px-3 py-2 text-sm hover:bg-secondary">
            Notificações
            {active.length > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-400 text-amber-950 px-1.5 h-4 text-[10px] font-semibold">
                {active.length > 9 ? "9+" : String(active.length)}
              </span>
            )}
          </button>
          <Link href="/settings" className="block rounded-md px-3 py-2 text-sm hover:bg-secondary">Configurações</Link>
          <button onClick={() => logout()} className="block w-full text-left rounded-md px-3 py-2 text-sm hover:bg-secondary text-destructive">
            Sair
          </button>
        </div>
      )}
      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base">Notificações</DialogTitle>
            <DialogDescription className="text-[13px]">Alertas e avisos da sua conta.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-auto">
            {active.length > 0 && (
              <div className="flex items-center justify-end pb-1">
                <button
                  className="text-primary font-semibold text-[13px] disabled:opacity-60"
                  disabled={markAll.isPending}
                  onClick={() => markAll.mutate(undefined)}
                >
                  Marcar todas como lidas
                </button>
                <button
                  className="ml-auto p-1.5 rounded-md text-foreground/70 hover:bg-secondary"
                  aria-pressed={eventOnly}
                  title={eventOnly ? "Mostrar todas" : "Somente eventos"}
                  onClick={() => setEventOnly((v) => !v)}
                >
                  <Filter size={14} />
                </button>
              </div>
            )}
            {active.length === 0 ? (
              <div className="text-[13px] text-muted-foreground">Sem novas notificações.</div>
            ) : (
              visibleNotifications.map((n) => {
                const isActivation = n.type === "EMAIL_VERIFICATION" || n.type === "PHONE_VERIFICATION";
                const icon =
                  n.type === "EVENT_TODAY" ? "🎉" :
                  n.type === "EVENT_TOMORROW" ? "📅" :
                  n.type === "EVENT_INTEREST_TOMORROW" ? "⭐" :
                  n.type === "EVENT_CANCELLED" ? "⚠️" :
                  n.type === "EVENT_DATE_CHANGED" ? "⏰" :
                  n.type === "EVENT_LOCATION_CHANGED" ? "📍" :
                  n.type === "EMAIL_VERIFICATION" ? "📧" :
                  n.type === "PHONE_VERIFICATION" ? "📱" : "🔔";
                return (
                <div key={n.id} className="rounded-lg border p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[13px] font-medium leading-tight inline-flex items-center gap-1"><span className="select-none">{icon}</span>{n.title}</div>
                    <div className="text-[11px] text-muted-foreground whitespace-nowrap">{formatRelativeTime(n.createdAt)}</div>
                  </div>
                  <div className="mt-1.5 text-[13px] text-foreground/75 leading-snug">{n.message}</div>
                  <div className="mt-2 flex items-center gap-3">
                    <Link
                      href={n.type === "PHONE_VERIFICATION" ? "/add-phone" : (n.type === "EMAIL_VERIFICATION" ? (me?.email ? `/verify-email?email=${encodeURIComponent(me.email)}` : "/verify-email") : (n.actionUrl || "/events"))}
                      className="text-primary font-semibold text-[13px]"
                      onClick={async () => {
                        if (!isActivation) {
                          try { await markRead.mutateAsync(n.id); } catch {}
                        }
                        setNotifOpen(false);
                      }}
                    >
                      Abrir
                    </Link>
                    {n.type === "EMAIL_VERIFICATION" && me?.email && (
                      <button
                        className="text-foreground/75 hover:underline text-[13px]"
                        onClick={async () => {
                          try {
                            await requestEmailCode(me.email as string);
                            toast.success("E-mail reenviado");
                          } catch (e) {
                            const message = e instanceof Error ? e.message : "Falha ao reenviar";
                            toast.error(message);
                          }
                        }}
                      >
                        Reenviar e-mail
                      </button>
                    )}
                    {!isActivation && (
                      <>
                        <button
                          className="text-foreground/75 hover:underline text-[13px]"
                          onClick={async () => {
                            await markRead.mutateAsync(n.id);
                          }}
                        >
                          Marcar como lida
                        </button>
                        <button
                          className="text-destructive hover:underline ml-auto text-[13px]"
                          onClick={async () => {
                            await complete.mutateAsync(n.id);
                          }}
                        >
                          Remover
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )})
            )}
            {read.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] mb-1 text-muted-foreground">Lidas</div>
                <div className="space-y-2">
                  {read.map((n) => (
                    <div key={n.id} className="rounded-lg border p-3 bg-secondary/50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-[13px] font-medium leading-tight">{n.title}</div>
                        <div className="text-[11px] text-muted-foreground whitespace-nowrap">{formatRelativeTime(n.createdAt)}</div>
                      </div>
                      <div className="text-[13px] text-foreground/75 leading-snug">{n.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
