"use client";
import { useCallback, useEffect, useMemo } from "react";
import { usePopularWeek, useTrendingInfinite } from "@/lib/queries/events";
import PopularEventCard from "@/components/events/popular-event-card";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import type { EventEntity } from "@/lib/api/events";
import { useEventInteractions } from "@/lib/stores/eventInteractionsStore";

export default function PopularRow({ myId }: { myId: string | null }) {
  void myId;
  const { data: week, isLoading } = usePopularWeek({ take: 20 });
  const weekEvents = useMemo(() => {
    const allEvents = week?.events ?? [];
    return allEvents.filter((event: EventEntity) => !event.isEnded);
  }, [week]);
  const useTrending = weekEvents.length === 0;
  const trending = useTrendingInfinite({ take: 20 });
  const events = useMemo(
    () => {
      if (useTrending) {
        const allTrendingEvents = trending.data?.pages.flatMap((p) => p.events) ?? [];
        return allTrendingEvents.filter((event: EventEntity) => !event.isEnded);
      }
      return weekEvents;
    },
    [useTrending, trending.data?.pages, weekEvents]
  );
  const setInteractions = useEventInteractions((state) => state.setInteractions);

  useEffect(() => {
    if (events.length > 0) {
      setInteractions(events);
    }
  }, [events, setInteractions]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const onScroll = useCallback(() => {
    if (!emblaApi || !useTrending) return;
    const scrollProgress = emblaApi.scrollProgress();
    if (scrollProgress > 0.8) {
      if (trending.hasNextPage && !trending.isFetchingNextPage) {
        trending.fetchNextPage();
      }
    }
  }, [emblaApi, useTrending, trending]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("scroll", onScroll);
    return () => {
      emblaApi.off("scroll", onScroll);
    };
  }, [emblaApi, onScroll]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">🔥 Populares da semana</h2>
        <Link
          href="/events"
          className="flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-800 hover:gap-2 transition-all"
        >
          Ver mais
          <ChevronRight size={16} />
        </Link>
      </div>
      {isLoading && weekEvents.length === 0 ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-72 min-w-[280px] rounded-2xl bg-secondary animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-sm text-muted-foreground p-8 text-center bg-white/50 rounded-xl">
          Nenhum evento popular esta semana
        </div>
      ) : (
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 pb-3">
            {events.map((ev: EventEntity) => (
              <div key={ev.id} className="flex-none w-[280px] min-w-0">
                <PopularEventCard
                  id={ev.id}
                  title={ev.title}
                  startDate={ev.startDate}
                  locationName={ev.locationName}
                  locationAddress={ev.locationAddress}
                  coverImageUrl={ev.coverImageUrl}
                  tags={ev.tags}
                  attendeeCount={ev.attendeeCount}
                  ownerUsername={ev.owner?.username ?? null}
                  isEnded={ev.isEnded}
                />
              </div>
            ))}
            {useTrending && trending.isFetchingNextPage && (
              <div className="flex-none w-[280px] h-72 rounded-2xl bg-secondary animate-pulse" />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
