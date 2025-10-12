"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveMap } from "@/lib/queries/events";
import { Card } from "@/components/ui/card";

declare global {
  interface Window { L?: any }
}

function useLeaflet() {
  const [leafletReady, setLeafletReady] = useState(false);
  const [clusterReady, setClusterReady] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    function loadCluster() {
      if (clusterReady) return;
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css";
      document.head.appendChild(css);
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js";
      script.onload = () => setClusterReady(true);
      document.body.appendChild(script);
    }
    if (window.L) { setLeafletReady(true); loadCluster(); return; }
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
    script.onload = () => { setLeafletReady(true); loadCluster(); };
    document.body.appendChild(script);
    return () => { script.remove(); css.remove(); };
  }, [clusterReady]);
  return { leafletReady, clusterReady };
}

export default function LiveMapInteractive() {
  const { data, isLoading } = useLiveMap(undefined);
  const markers = data?.markers || [];
  const center = useMemo(() => {
    if (markers.length === 0) return { lat: -14.235, lng: -51.9253 };
    const mid = Math.floor(markers.length / 2);
    return { lat: markers[mid].lat, lng: markers[mid].lng };
  }, [markers]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<any>(null);
  const { leafletReady, clusterReady } = useLeaflet();

  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapObj.current) return;
    const L = window.L!;
    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([center.lat, center.lng], 5);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap, &copy; CARTO'
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapObj.current = map;
  }, [leafletReady, center]);

  useEffect(() => {
    if (!leafletReady || !mapObj.current) return;
    const L = window.L!;
    const map = mapObj.current;
    const teal = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#24BFBF";
    const group = clusterReady && L.markerClusterGroup ? L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 14,
      iconCreateFunction: (cluster: any) => {
        const teal = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#24BFBF";
        const count = cluster.getChildCount();
        const html = `<div style="
          display:flex;align-items:center;justify-content:center;
          width:32px;height:32px;border-radius:9999px;
          background:${teal};color:white;font-weight:600;box-shadow:0 6px 18px rgba(0,0,0,.12);
        ">${count}</div>`;
        return L.divIcon({ html, className: "", iconSize: [32, 32] });
      },
    }) : L.layerGroup();
    markers.forEach((m: any) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:9999px;border:2px solid ${teal};background:${teal}33"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const marker = L.marker([m.lat, m.lng], { icon });
      const content = `
        <div style="min-width:180px; font-size:12px; line-height:1.2">
          <div style="font-weight:600; margin-bottom:2px">${m.title}</div>
          <div style="color:#6B7280">${m.locationName || "Local a definir"}</div>
        </div>`;
      marker.bindTooltip(content, { direction: 'top', opacity: 1, sticky: true, className: 'agitto-map-tip', offset: [0, -8] });
      marker.on('click', () => { window.location.href = `/events/${m.id}`; });
      group.addLayer(marker);
    });
    group.addTo(map);
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m: any) => [m.lat, m.lng] as [number, number]));
      const size = map.getSize();
      const padding = Math.min(size.x, size.y) * 0.15;
      map.fitBounds(bounds, { padding: [padding, padding], maxZoom: 13 });
      if (markers.length === 1) map.setZoom(13);
    } else {
      map.setView([center.lat, center.lng], 5);
    }
    return () => { group.clearLayers(); map.removeLayer(group); };
  }, [markers, leafletReady, clusterReady, center]);

  // No filters; center via markers or default

  return (
    <Card className="p-4 border-transparent bg-white/70 backdrop-blur">
      <div className="text-sm font-semibold mb-3">Mapa ao vivo</div>
      <div className="relative rounded-2xl overflow-hidden ring-1 ring-black/5 bg-white/60 backdrop-blur">
        <div ref={mapRef} className="w-full h-64" />
        {!leafletReady && (
          <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Carregando mapa…</div>
        )}
        {leafletReady && isLoading && (
          <div className="absolute top-2 left-2 rounded-md bg-white/80 px-2 py-1 text-xs">Atualizando…</div>
        )}
        {leafletReady && !isLoading && markers.length === 0 && (
          <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
            Nenhum evento público no momento
          </div>
        )}
      </div>
    </Card>
  );
}
