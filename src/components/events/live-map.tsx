"use client";
import { useMemo, useState } from "react";
import { useLiveMap } from "@/lib/queries/events";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { LiveMapMarker } from "@/lib/api/events";

export default function LiveMapWidget() {
  const [city, setCity] = useState("");
  const { data, isLoading, refetch } = useLiveMap({ locationCity: city || undefined });
  const markers = useMemo(() => data?.markers ?? [], [data?.markers]);
  const validMarkers = useMemo(
    () => markers.filter((m): m is LiveMapMarker => typeof (m as LiveMapMarker | undefined)?.lat === "number" && typeof (m as LiveMapMarker | undefined)?.lng === "number"),
    [markers]
  );
  const center = useMemo(() => {
    if (validMarkers.length === 0) return { lat: -8.0476, lng: -34.8770 };
    const mid = Math.floor(validMarkers.length / 2);
    return { lat: validMarkers[mid].lat, lng: validMarkers[mid].lng };
  }, [validMarkers]);
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${center.lat},${center.lng}`;

  return (
    <Card className="p-4 bg-white/70 backdrop-blur border-transparent">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">Mapa ao vivo</div>
        <div className="flex items-center gap-2">
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" className="h-8 w-32" />
          <Button size="sm" onClick={() => refetch()}>Filtrar</Button>
        </div>
      </div>
      <div className="rounded-lg overflow-hidden border bg-secondary">
        <iframe title="live-map" src={mapUrl} className="w-full h-56" />
      </div>
      <div className="mt-3 space-y-2">
        {isLoading ? (
          <div className="text-xs text-muted-foreground">Carregando…</div>
        ) : markers.length === 0 ? (
          <div className="text-xs text-muted-foreground">Sem eventos públicos por aqui.</div>
        ) : (
          validMarkers.slice(0, 5).map((m: LiveMapMarker) => (
            <Link key={m.id} href={`/events/${m.id}`} className="block rounded-md border px-2 py-2 text-xs hover:bg-secondary/70">
              <div className="font-medium truncate">{m.title}</div>
              <div className="text-muted-foreground truncate">{m.locationName || "Local a definir"}</div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
