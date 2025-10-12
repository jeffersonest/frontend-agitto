"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInfiniteEvents, useDeleteEvent } from "@/lib/queries/events";
import { getMe } from "@/lib/api/auth";
import { EventStatus } from "@/lib/api/events";
import Link from "next/link";
import { Pencil, Trash2, Calendar, MapPin } from "lucide-react";

export default function MyEventsPage() {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [status, setStatus] = useState<EventStatus | "ALL">("ALL");
  const [city, setCity] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    getMe().then((m: any) => setOwnerId(m?.id ?? null)).catch(() => setOwnerId(null));
  }, []);

  const params = useMemo(() => ({ ownerId: ownerId || undefined, status: status === "ALL" ? undefined : status, locationCity: city || undefined, take: 20 }), [ownerId, status, city]);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteEvents(params);
  useEffect(() => { refetch(); }, [refreshKey, refetch]);
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

  return (
    <div className="min-h-screen p-6 flex items-start justify-center">
      <Card className="w-full max-w-5xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader title="Meus eventos" />
          <Button asChild>
            <Link href="/events/new">Criar evento</Link>
          </Button>
        </div>

        <form onSubmit={onApplyFilters} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-foreground/70">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="h-11 w-full rounded-lg border bg-secondary px-3 py-2 text-sm">
              <option value="ALL">Todos</option>
              <option value="DRAFT">Rascunho</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="COMPLETED">Encerrado</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-foreground/70">Cidade</label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Filtrar por cidade" />
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" className="w-full">Filtrar</Button>
            <Button type="button" variant="secondary" className="w-full" onClick={onClearFilters}>Limpar filtros</Button>
          </div>
        </form>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-secondary animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-sm text-muted-foreground">Não encontramos nenhum evento.</div>
        ) : (
          <div className="space-y-2">
            {events.map((ev) => (
              <div key={ev.id} className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 rounded-lg border px-3 py-3">
                <div className="sm:col-span-4 min-w-0">
                  <div className="text-sm font-medium truncate">{ev.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-2">
                    <span className="inline-flex items-center gap-1"><Calendar size={14} />{formatShort(ev.startDate)}</span>
                    {ev.locationAddress && (
                      <span className="inline-flex items-center gap-1"><MapPin size={14} />{cityFromAddress(ev.locationAddress)}</span>
                    )}
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <StatusBadge status={ev.status} />
                </div>
                <div className="sm:col-span-3 text-sm text-muted-foreground">{ev.attendeeCount} participantes</div>
                <div className="sm:col-span-2 flex items-center justify-end gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/events/${ev.id}/edit`} className="inline-flex items-center gap-1"><Pencil size={16} />Editar</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={del.isPending}
                    onClick={async () => {
                      if (!confirm("Excluir este evento?")) return;
                      await del.mutateAsync(ev.id);
                      setRefreshKey((k) => k + 1);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
            <div ref={sentinelRef} className="h-8" />
            {isFetchingNextPage && <div className="text-center text-sm text-muted-foreground">Carregando…</div>}
          </div>
        )}
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: EventStatus }) {
  const cfg = statusConfig(status);
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs" style={{ backgroundColor: cfg.bg, color: cfg.fg }}>
      <span className="size-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function statusConfig(s: EventStatus) {
  if (s === "PUBLISHED") return { label: "Publicado", bg: "#ECFDF5", fg: "#065F46", dot: "#10B981" };
  if (s === "DRAFT") return { label: "Rascunho", bg: "#F3F4F6", fg: "#374151", dot: "#9CA3AF" };
  if (s === "CANCELLED") return { label: "Cancelado", bg: "#FEF2F2", fg: "#991B1B", dot: "#EF4444" };
  return { label: "Encerrado", bg: "#EEF2FF", fg: "#3730A3", dot: "#6366F1" };
}

function formatShort(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

function cityFromAddress(address: string) {
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 3) return parts[2];
  return address;
}

