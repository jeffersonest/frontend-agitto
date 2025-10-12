"use client";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { useInfiniteEvents } from "@/lib/queries/events";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import { getMe } from "@/lib/api/auth";
import EventCard from "@/components/events/event-card";
import LiveMapInteractive from "@/components/events/live-map-interactive";
import PopularRow from "@/components/events/popular-row";

export default function EventsPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteEvents({ status: "PUBLISHED", take: 12 });
  const events = useMemo(() => (data?.pages || []).flatMap((p) => p.events), [data]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [myId, setMyId] = useState<string | null>(null);

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
    getMe().then((m: any) => setMyId(m?.id ?? null)).catch(() => setMyId(null));
  }, []);
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
      <div
        className="absolute inset-x-0 top-0 h-72 sm:h-96 -z-10"
        style={{
          background: "linear-gradient(135deg, var(--primary-tint-1), rgba(167,139,250,0.25))",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div className="relative w-full pt-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl bg-white/85 backdrop-blur p-5 flex items-center justify-between shadow-sm">
            <h1 className="text-xl sm:text-2xl font-semibold">O que está rolando perto de você</h1>
            <Button asChild><Link href="/events/new">Criar evento</Link></Button>
          </div>
        </div>
      </div>
      <div className="px-6 pt-6 flex items-start justify-center">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {typeof minsLeft === "number" && minsLeft <= 10 && minsLeft > 0 && (
              <div className="rounded-xl bg-amber-50 text-amber-900 border border-amber-200 px-4 py-3 text-sm">
                Sua sessão expira em aproximadamente {minsLeft} min. Faça login novamente para evitar interrupções.
              </div>
            )}
            <PopularRow myId={myId} />
            <LiveMapInteractive />
            <Card className="p-6 space-y-6 border-transparent shadow-none bg-white/70 backdrop-blur">
            <div className="flex items-center justify-between">
              <PageHeader title="Eventos" />
            </div>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 rounded-2xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-sm text-muted-foreground">Nenhum evento encontrado.</div>
        ) : (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
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
            <Card className="p-4 border-transparent bg-white/70 backdrop-blur">
              <div className="text-sm font-semibold mb-3">Mensagens recentes</div>
              <div className="space-y-2 text-sm">
                <div className="rounded-lg border px-3 py-2">Sem mensagens por enquanto.</div>
              </div>
            </Card>
            <Card className="p-4 border-transparent bg-white/70 backdrop-blur">
              <div className="text-sm font-semibold mb-3">Destaques</div>
              <div className="text-sm text-muted-foreground">Curadoria semanal de eventos públicos.</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function categoryFromTags(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) return "Esporte";
  const t = tags[0]?.toLowerCase();
  if (/(fut|soccer|football)/.test(t)) return "Futebol";
  if (/(basquete|basket)/.test(t)) return "Basquete";
  if (/(natação|swim)/.test(t)) return "Natação";
  if (/(bal(e|é)t|ballet)/.test(t)) return "Balé";
  if (/(corrida|run)/.test(t)) return "Corrida";
  if (/(luta|mma|jiu|karat|muay|boxe|boxing)/.test(t)) return "Luta";
  return capitalize(tags[0]);
}

function categoryColor(cat: string): string {
  switch (cat) {
    case "Futebol": return "#16a34a"; // green
    case "Basquete": return "#f97316"; // orange
    case "Natação": return "#0ea5e9"; // sky
    case "Balé": return "#ec4899"; // pink
    case "Corrida": return "#22c55e"; // green light
    case "Luta": return "#ef4444"; // red
    default: return "#8B5CF6"; // lavender-600
  }
}

function capitalize(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

function categoryEmoji(cat: string): string {
  switch (cat) {
    case "Futebol": return "⚽";
    case "Basquete": return "🏀";
    case "Natação": return "🏊";
    case "Balé": return "🩰";
    case "Corrida": return "🏃";
    case "Luta": return "🥊";
    default: return "🏅";
  }
}
