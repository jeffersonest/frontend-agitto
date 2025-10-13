"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import PageHero from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInfiniteEvents, useDeleteEvent } from "@/lib/queries/events";
import { getMe } from "@/lib/api/auth";
import { EventStatus } from "@/lib/api/events";
import Link from "next/link";
import UsernameChip from "@/components/ui/username-chip";
import { Pencil, Trash2, Calendar, MapPin, Users, Plus, Filter, X } from "lucide-react";
import { categoryFromTags, categoryColorHex, categoryEmoji } from "@/lib/events/category";
import { formatEventDate, formatLocationShort } from "@/lib/events/format";
import { GradientHeader } from "@/components/ui/gradient-header";
import MyEventsCalendar from "@/components/events/my-events-calendar";

export default function MyEventsPage() {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [ownerUsername, setOwnerUsername] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "calendar">("grid");
  const [status, setStatus] = useState<EventStatus | "ALL">("ALL");
  const [city, setCity] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    getMe().then((m: unknown) => { 
      const user = m as { id?: string; username?: string } | null;
      setOwnerId(user?.id ?? null); 
      setOwnerUsername(user?.username ?? null); 
    }).catch(() => { 
      setOwnerId(null); 
      setOwnerUsername(null); 
    });
  }, []);

  const params = useMemo(() => ({ 
    ownerId: ownerId || undefined, 
    status: status === "ALL" ? undefined : status, 
    locationCity: city || undefined, 
    take: 20 
  }), [ownerId, status, city]);
  
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteEvents(params);
  
  useEffect(() => { 
    refetch(); 
  }, [refreshKey, refetch]);
  
  const events = useMemo(() => (data?.pages || []).flatMap((p) => p.events), [data]);
  const del = useDeleteEvent();
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

  function onApplyFilters(e: React.FormEvent) {
    e.preventDefault();
    setRefreshKey((k) => k + 1);
  }

  function onClearFilters() {
    setStatus("ALL");
    setCity("");
    setRefreshKey((k) => k + 1);
  }

  const hasActiveFilters = status !== "ALL" || city !== "";

  return (
    <div className="min-h-screen space-y-6">
      <GradientHeader height="sm" />
      <PageHero
        title="Meus eventos"
        description={`${events.length || 0} eventos criados por você`}
        actions={(
          <Button asChild className="gap-2">
            <Link href="/events/new"><Plus size={16} />Criar evento</Link>
          </Button>
        )}
      />

      <div className="flex items-center justify-between px-1">
        <div className="inline-flex items-center gap-1 rounded-xl bg-white/80 p-1 ring-1 ring-black/5">
          <button className={`px-3 py-1.5 rounded-lg text-sm ${view === "grid" ? "bg-primary text-white" : "text-foreground"}`} onClick={() => setView("grid")}>Grade</button>
          <button className={`px-3 py-1.5 rounded-lg text-sm ${view === "calendar" ? "bg-primary text-white" : "text-foreground"}`} onClick={() => setView("calendar")}>Calendário</button>
        </div>
      </div>

      {/* Filters Section */}
      {view === "grid" && (
      <Card className="p-4 bg-white/80 backdrop-blur border-0 ring-1 ring-black/5">
        <form onSubmit={onApplyFilters} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as EventStatus | "ALL")} 
                className="h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">Todos os status</option>
                <option value="DRAFT">Rascunho</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="CANCELLED">Cancelado</option>
                <option value="COMPLETED">Encerrado</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Cidade</label>
              <Input 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                placeholder="Filtrar por cidade" 
                className="h-10"
              />
            </div>
            
            <div className="flex items-end gap-2">
              <Button type="submit" className="flex-1 gap-2 h-10">
                <Filter size={16} />
                Filtrar
              </Button>
              {hasActiveFilters && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClearFilters}
                  className="gap-2 h-10"
                >
                  <X size={16} />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>
      )}

      {view === "grid" ? (
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-24 bg-secondary/50 animate-pulse border-0 ring-1 ring-black/5" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card className="p-8 text-center bg-white/80 backdrop-blur border-0 ring-1 ring-black/5">
            <div className="space-y-3">
              <div className="text-4xl">📅</div>
              <h3 className="text-lg font-semibold">Nenhum evento encontrado</h3>
              <p className="text-muted-foreground text-sm">
                {hasActiveFilters 
                  ? "Tente ajustar os filtros ou criar um novo evento." 
                  : "Que tal criar seu primeiro evento?"
                }
              </p>
              <Button asChild className="mt-4">
                <Link href="/events/new">Criar evento</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <EventListItem
                key={ev.id}
                event={ev}
                ownerUsername={ownerUsername}
                onDelete={async () => {
                  if (!confirm("Tem certeza que deseja excluir este evento?")) return;
                  await del.mutateAsync(ev.id);
                  setRefreshKey((k) => k + 1);
                }}
                isDeleting={del.isPending}
              />
            ))}
            
            <div ref={sentinelRef} className="h-4" />
            
            {isFetchingNextPage && (
              <Card className="p-4 text-center bg-white/60 backdrop-blur border-0 ring-1 ring-black/5">
                <div className="text-sm text-muted-foreground">Carregando mais eventos...</div>
              </Card>
            )}
          </div>
        )}
      </div>
      ) : (
        <MyEventsCalendar />
      )}
    </div>
  );
}

function EventListItem({ 
  event, 
  ownerUsername, 
  onDelete, 
  isDeleting 
}: { 
  event: {
    id: string;
    title: string;
    startDate?: string;
    tags?: string[];
    locationName?: string | null;
    locationAddress?: string | null;
    attendeeCount?: number;
    status: EventStatus;
  }; 
  ownerUsername: string | null; 
  onDelete: () => void; 
  isDeleting: boolean;
}) {
  const cat = categoryFromTags(event.tags);
  let color = categoryColorHex(cat);
  if (!color || color === "#fff" || color === "#ffffff") color = "#3b82f6";
  
  function isLight(hex: string) {
    if (!hex) return false;
    const c = hex.replace('#', '');
    const r = parseInt(c.substr(0,2),16), g = parseInt(c.substr(2,2),16), b = parseInt(c.substr(4,2),16);
    return (r*0.299 + g*0.587 + b*0.114) > 186;
  }
  
  const textColor = isLight(color) ? '#222' : '#fff';
  const dateText = formatEventDate(event.startDate);
  const locationText = formatLocationShort(event.locationName, event.locationAddress);
  const showUsername = ownerUsername && ownerUsername.toLowerCase() !== "insecure";

  return (
    <Card className="overflow-hidden bg-white/80 backdrop-blur border-0 ring-1 ring-black/5 hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Event Info */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3 flex-wrap">
              {showUsername && ownerUsername && (
                <UsernameChip username={ownerUsername} variant="tint" size="xs" />
              )}
              <span 
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ backgroundColor: color, color: textColor }}
              >
                <span>{categoryEmoji(cat)}</span>
                <span>{cat}</span>
              </span>
              <StatusBadge status={event.status} />
            </div>

            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold text-foreground line-clamp-2 leading-tight">
                {event.title}
              </h3>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {dateText && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>{dateText}</span>
                </div>
              )}
              {locationText && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  <span className="truncate max-w-xs">{locationText}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Users size={14} />
                <span>{event.attendeeCount || 0} participantes</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href={`/events/${event.id}/edit`}>
                <Pencil size={14} />
                Editar
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={onDelete}
              className="gap-2"
            >
              <Trash2 size={14} />
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: EventStatus }) {
  const cfg = statusConfig(status);
  return (
    <span 
      className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.fg }}
    >
      <span 
        className="size-1.5 rounded-full" 
        style={{ backgroundColor: cfg.dot }} 
      />
      {cfg.label}
    </span>
  );
}

function statusConfig(s: EventStatus) {
  if (s === "PUBLISHED") return { 
    label: "Publicado", 
    bg: "#ECFDF5", 
    fg: "#065F46", 
    dot: "#10B981" 
  };
  if (s === "DRAFT") return { 
    label: "Rascunho", 
    bg: "#F3F4F6", 
    fg: "#374151", 
    dot: "#9CA3AF" 
  };
  if (s === "CANCELLED") return { 
    label: "Cancelado", 
    bg: "#FEF2F2", 
    fg: "#991B1B", 
    dot: "#EF4444" 
  };
  return { 
    label: "Encerrado", 
    bg: "#EEF2FF", 
    fg: "#3730A3", 
    dot: "#6366F1" 
  };
}
