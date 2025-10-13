"use client";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { useInfiniteEvents, useFollowingFeedInfinite, useDiscoveryInfinite } from "@/lib/queries/events";
import type { EventEntity } from "@/lib/api/events";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import { getMe } from "@/lib/api/auth";
import EventCard from "@/components/events/event-card";
import LiveMapInteractive from "@/components/events/live-map-interactive";
import PopularRow from "@/components/events/popular-row";

import { GradientHeader } from "@/components/ui/gradient-header";

export default function EventsPage() {
  const [tab, setTab] = useState<"nearby" | "following" | "discovery">("nearby");
  const nearby = useInfiniteEvents({ status: "PUBLISHED", take: 12 }, { enabled: tab === "nearby" });
  const following = useFollowingFeedInfinite({ take: 12, enabled: tab === "following" });
  const discovery = useDiscoveryInfinite({ take: 12, enabled: tab === "discovery" });
  const data = tab === "nearby" ? nearby.data : (tab === "following" ? following.data : discovery.data);
  const isLoading = tab === "nearby" ? nearby.isLoading : (tab === "following" ? following.isLoading : discovery.isLoading);
  const fetchNextPage = tab === "nearby" ? nearby.fetchNextPage : (tab === "following" ? following.fetchNextPage : discovery.fetchNextPage);
  const hasNextPage = tab === "nearby" ? nearby.hasNextPage : (tab === "following" ? following.hasNextPage : discovery.hasNextPage);
  const isFetchingNextPage = tab === "nearby" ? nearby.isFetchingNextPage : (tab === "following" ? following.isFetchingNextPage : discovery.isFetchingNextPage);
  const events: EventEntity[] = useMemo(() => (data?.pages || []).flatMap((p: { events: EventEntity[] }) => p.events), [data]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize tab from localStorage after mount to avoid SSR hydration mismatch
    try {
      const saved = typeof window !== "undefined" ? (localStorage.getItem("agitto:feedTab") as "nearby" | "following" | "discovery" | null) : null;
      if (saved === "nearby" || saved === "following" || saved === "discovery") setTab(saved);
    } catch {}
  }, []);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    getMe().then((m: unknown) => {
      const user = m as { id?: string };
      setMyId(user?.id ?? null);
    }).catch(() => setMyId(null));
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("agitto:feedTab", tab);
  }, [tab]);
  const [minsLeft, setMinsLeft] = useState<number | null>(null);
  useEffect(() => {
    import("@/lib/auth/token").then(({ getTokenInfo }) => {
      const info = getTokenInfo();
      if (!info.token || !info.exp) return;
      const update = () => {
        const i = getTokenInfo();
        if (!i.remainingMs) { setMinsLeft(null); return; }
        setMinsLeft(Math.max(0, Math.round(i.remainingMs / 60000)));
      };
      update();
      const id = setInterval(update, 30_000);
      return () => clearInterval(id);
    });
  }, []);
  return (
    <div className="min-h-screen">
      <GradientHeader />
      <div className="relative w-full pt-16">
        <div className="mx-auto max-w-8xl px-6">
          <div className="rounded-2xl bg-white/85 backdrop-blur p-5 flex items-center justify-between shadow-sm">
            <h1 className="text-xl sm:text-2xl font-semibold">O que está rolando perto de você</h1>
            <Button asChild><Link href="/events/new">Criar evento</Link></Button>
          </div>
        </div>
      </div>
      <div className="px-6 pt-6 flex items-start justify-center">
        <div className="w-full max-w-8xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {typeof minsLeft === "number" && minsLeft <= 10 && minsLeft > 0 && (
              <div className="rounded-xl bg-amber-50 text-amber-900 border border-amber-200 px-4 py-3 text-sm">
                Sua sessão expira em aproximadamente {minsLeft} min. Faça login novamente para evitar interrupções.
              </div>
            )}
            <PopularRow myId={myId} />
            <LiveMapInteractive />
            <Card className="p-6 space-y-6 border-transparent ring-1 ring-black/5 shadow-none bg-white/70 backdrop-blur">
            <div className="flex items-center justify-between">
              <PageHeader title="Eventos" />
            </div>
            <div className="inline-flex items-center gap-1 rounded-xl bg-white/80 p-1 ring-1 ring-black/5">
              <button className={`px-3 py-1.5 rounded-lg text-sm ${tab === "nearby" ? "bg-primary text-white" : "text-foreground"}`} onClick={() => setTab("nearby")}>Perto de mim</button>
              <button className={`px-3 py-1.5 rounded-lg text-sm ${tab === "discovery" ? "bg-primary text-white" : "text-foreground"}`} onClick={() => setTab("discovery")}>Para você</button>
              <button className={`px-3 py-1.5 rounded-lg text-sm ${tab === "following" ? "bg-primary text-white" : "text-foreground"}`} onClick={() => setTab("following")}>Seguindo</button>
            </div>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 rounded-2xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          tab === "following" ? (
            <div className="rounded-2xl ring-1 ring-black/5 bg-white/70 backdrop-blur p-6 text-center space-y-3">
              <div className="text-sm text-muted-foreground">
                {myId ? "Siga pessoas para ver eventos nesta aba." : "Faça login para ver eventos de quem você segue."}
              </div>
              <div className="flex items-center justify-center gap-2">
                {!myId ? (
                  <Button asChild>
                    <Link href="/login">Entrar</Link>
                  </Button>
                ) : (
                  <Button asChild variant="secondary">
                    <Link href="/settings">Descobrir/seguir pessoas</Link>
                  </Button>
                )}
              </div>
            </div>
          ) : tab === "discovery" ? (
            <div className="rounded-2xl ring-1 ring-black/5 bg-white/70 backdrop-blur p-6 text-center space-y-3">
              <div className="text-sm text-muted-foreground">Sem recomendações ainda. Participe de eventos e marque interesse para melhorar suas sugestões.</div>
              <div className="flex items-center justify-center gap-2">
                <Button asChild>
                  <Link href="/events">Explorar eventos</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Nenhum evento encontrado.</div>
          )
        ) : (
          <>
            <div className="grid gap-8 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
              {events.map((ev) => (
                <EventCard
                  key={ev.id}
                  id={ev.id}
                  title={ev.title}
                  startDate={ev.startDate}
                  locationName={ev.locationName}
                  locationAddress={ev.locationAddress}
                  coverImageUrl={ev.coverImageUrl}
                  tags={ev.tags}
                  attendeeCount={ev.attendeeCount}
                  isOwner={myId ? ev.ownerId === myId : false}
                  ownerUsername={(ev as { owner?: { username?: string } })?.owner?.username || null}
                  likedByMe={(ev as { viewer?: { likedByMe?: boolean } })?.viewer?.likedByMe ?? false}
                  rsvpStatus={(ev as { viewer?: { rsvpStatus?: "GOING" | "INTERESTED" | "DECLINED" | null } })?.viewer?.rsvpStatus ?? null}
                />
              ))}
            </div>
            <div ref={sentinelRef} className="h-8" />
            {isFetchingNextPage && <div className="text-center text-sm text-muted-foreground">Carregando…</div>}
          </>
        )}
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-4 border-transparent ring-1 ring-black/5 bg-white/70 backdrop-blur">
              <div className="text-sm font-semibold mb-3">Mensagens recentes</div>
              <div className="space-y-2 text-sm">
                <div className="rounded-lg border px-3 py-2">Sem mensagens por enquanto.</div>
              </div>
            </Card>
            <Card className="p-4 border-transparent ring-1 ring-black/5 bg-white/70 backdrop-blur">
              <div className="text-sm font-semibold mb-3">Destaques</div>
              <div className="text-sm text-muted-foreground">Curadoria semanal de eventos públicos.</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
