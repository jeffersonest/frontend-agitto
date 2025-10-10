"use client";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { useInfiniteEvents } from "@/lib/queries/events";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef } from "react";
import EventCard from "@/components/events/event-card";

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
                />
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
