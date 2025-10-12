"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveMap } from "@/lib/queries/events";
import { Card } from "@/components/ui/card";

declare global {
  interface Window { L?: any }
}

function useLeaflet() {
  const [ready, setReady] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.L) { setReady(true); return; }
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    css.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    css.crossOrigin = "";
    document.head.appendChild(css);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = () => setReady(true);
    document.body.appendChild(script);
    return () => { script.remove(); css.remove(); };
  }, []);
  return ready;
}

export default function LiveMapInteractive() {
  const { data, isLoading } = useLiveMap({ city: "Recife" });
  const markers = data?.markers || [];
  const center = useMemo(() => {
    if (markers.length === 0) return { lat: -8.0476, lng: -34.8770 };
    const mid = Math.floor(markers.length / 2);
    return { lat: markers[mid].lat, lng: markers[mid].lng };
  }, [markers]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<any>(null);
  const ready = useLeaflet();

  useEffect(() => {
    if (!ready || !mapRef.current || mapObj.current) return;
    const L = window.L!;
    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([center.lat, center.lng], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapObj.current = map;
  }, [ready, center]);

  useEffect(() => {
    if (!ready || !mapObj.current) return;
    const L = window.L!;
    const map = mapObj.current;
    const teal = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#24BFBF";
    const layerGroup = L.layerGroup();
    markers.forEach((m: any) => {
      const circle = L.circleMarker([m.lat, m.lng], { radius: 8, color: teal, weight: 2, fillColor: teal, fillOpacity: 0.25 });
      const content = `
        <div style="min-width:180px; font-size:12px; line-height:1.2">
          <div style="font-weight:600; margin-bottom:2px">${m.title}</div>
          <div style="color:#6B7280">${m.locationName || "Local a definir"}</div>
        </div>`;
      circle.bindTooltip(content, { direction: 'top', opacity: 1, sticky: true, className: 'agitto-map-tip', offset: [0, -8] });
      circle.on('mouseover', () => circle.openTooltip());
      circle.on('mouseout', () => circle.closeTooltip());
      circle.on('click', () => { window.location.href = `/events/${m.id}`; });
      circle.addTo(layerGroup);
    });
    layerGroup.addTo(map);
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m: any) => [m.lat, m.lng] as [number, number]));
      map.fitBounds(bounds.pad(0.2));
    } else {
      map.setView([center.lat, center.lng], 12);
    }
    return () => { layerGroup.clearLayers(); map.removeLayer(layerGroup); };
  }, [markers, ready, center]);

  // No filters; center via markers or default

  return (
    <Card className="p-4 border-transparent bg-white/70 backdrop-blur">
      <div className="text-sm font-semibold mb-3">Mapa ao vivo</div>
      <div className="relative rounded-lg overflow-hidden border bg-secondary">
        <div ref={mapRef} className="w-full h-64" />
        {!ready && (
          <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Carregando mapa…</div>
        )}
        {ready && isLoading && (
          <div className="absolute top-2 left-2 rounded-md bg-white/80 px-2 py-1 text-xs">Atualizando…</div>
        )}
      </div>
    </Card>
  );
}
