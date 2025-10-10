"use client";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { useInfiniteEvents } from "@/lib/queries/events";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef } from "react";

export default function EventsPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteEvents({ status: "PUBLISHED", take: 12 });
  const events = useMemo(() => (data?.pages || []).flatMap((p) => p.events), [data]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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
  return (
    <div className="min-h-screen p-6 flex items-start justify-center">
      <Card className="w-full max-w-3xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader title="Eventos" />
          <Button asChild>
            <Link href="/events/new">Criar evento</Link>
          </Button>
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((ev) => (
                <Link key={ev.id} href={`/events/${ev.id}`} className="group relative rounded-2xl overflow-hidden border bg-secondary/30 hover:shadow-lg transition-shadow">
                  <div
                    className="absolute inset-0 bg-center bg-cover"
                    style={{ backgroundImage: ev.coverImageUrl ? `url(${ev.coverImageUrl})` : "none" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/30 to-black/50" />
                  <div className="relative p-4 h-56 flex flex-col justify-end">
                    <div className="mb-2">
                      <span className="rounded-full text-white text-xs px-2 py-0.5 flex items-center gap-1" style={{ backgroundColor: categoryColor(categoryFromTags(ev.tags)) }}>
                        <span>{categoryEmoji(categoryFromTags(ev.tags))}</span>
                        <span>{categoryFromTags(ev.tags)}</span>
                      </span>
                    </div>
                    <div className="bg-white/90 backdrop-blur rounded-xl p-3">
                      <div className="font-medium line-clamp-1">{ev.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{ev.locationName || ev.locationAddress}</div>
                      <div className="text-xs text-muted-foreground">{new Date(ev.startDate).toLocaleString()}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div ref={sentinelRef} className="h-8" />
            {isFetchingNextPage && <div className="text-center text-sm text-muted-foreground">Carregando…</div>}
          </>
        )}
      </Card>
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
