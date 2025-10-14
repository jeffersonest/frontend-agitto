"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveMap } from "@/lib/queries/events";
import { Card } from "@/components/ui/card";
import type { LiveMapMarker } from "@/lib/api/events";
import type { Leaflet, LeafletMap, LayerGroup } from "@/types/leaflet";

function useLeaflet() {
  const [leafletReady, setLeafletReady] = useState(false);
  const [clusterReady, setClusterReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function ensurePreconnect(href: string) {
      const id = `preconnect-${href}`;
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "preconnect";
      link.href = href;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }

    ensurePreconnect("https://unpkg.com");
    ensurePreconnect("https://cdn.jsdelivr.net");
    ensurePreconnect("https://basemaps.cartocdn.com");

    const loadCssWithFallback = (urls: string[]) => {
      return new Promise<void>((resolve) => {
        let i = 0;
        const tryLoad = () => {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = urls[i];
          link.onload = () => resolve();
          link.onerror = () => { i++; if (i < urls.length) tryLoad(); };
          document.head.appendChild(link);
        };
        tryLoad();
      });
    };

    const loadScriptWithFallback = (urls: string[]) => {
      return new Promise<void>((resolve) => {
        let i = 0;
        const tryLoad = () => {
          const s = document.createElement("script");
          s.src = urls[i];
          s.async = true;
          s.onload = () => resolve();
          s.onerror = () => { i++; if (i < urls.length) tryLoad(); };
          document.body.appendChild(s);
        };
        tryLoad();
      });
    };

    async function loadLeafletAll() {
      if (window.L) { setLeafletReady(true); return; }
      await loadCssWithFallback([
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
        "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css",
      ]);
      await loadScriptWithFallback([
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
        "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js",
      ]);
      setLeafletReady(true);
    }

    async function loadCluster() {
      if (clusterReady) return;
      await loadCssWithFallback([
        "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css",
        "https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/MarkerCluster.css",
      ]);
      await loadCssWithFallback([
        "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css",
        "https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css",
      ]);
      await loadScriptWithFallback([
        "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js",
        "https://cdn.jsdelivr.net/npm/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js",
      ]);
      setClusterReady(true);
    }

    loadLeafletAll().then(loadCluster);
  }, [clusterReady]);

  return { leafletReady, clusterReady };
}

export default function LiveMapInteractive() {
  const { data, isLoading } = useLiveMap(undefined);
  const markers = useMemo(() => data?.markers ?? [], [data?.markers]);
  const validMarkers = useMemo(() => {
    const isValidCoord = (v: unknown) => typeof v === "number" && Number.isFinite(v);
    const inRange = (lat: number, lng: number) => lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    return markers.filter((m): m is LiveMapMarker => {
      const lat = (m as LiveMapMarker | undefined)?.lat as unknown;
      const lng = (m as LiveMapMarker | undefined)?.lng as unknown;
      if (!isValidCoord(lat) || !isValidCoord(lng)) return false;
      return inRange(lat as number, lng as number);
    });
  }, [markers]);
  const center = useMemo(() => {
    if (validMarkers.length === 0) return { lat: -14.235, lng: -51.9253 };
    const mid = Math.floor(validMarkers.length / 2);
    return { lat: validMarkers[mid].lat, lng: validMarkers[mid].lng };
  }, [validMarkers]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<LeafletMap | null>(null);
  const { leafletReady, clusterReady } = useLeaflet();
  const [visible, setVisible] = useState(false);

  // Create map only when container is visible to avoid layout glitches
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) setVisible(true);
    }, { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!leafletReady || !visible || !mapRef.current || mapObj.current) return;
    const L = window.L as Leaflet;
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
      updateWhenIdle: true,
      inertia: true,
      wheelDebounceTime: 40,
      zoomAnimation: true,
      fadeAnimation: true,
      keepBuffer: 2 as unknown as number,
    }).setView([center.lat, center.lng], 5);

    const base = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      detectRetina: true,
      subdomains: "abcd",
      crossOrigin: true,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    });
    (base as unknown as { on: (ev: string, cb: () => void) => void }).on?.("tileerror", () => {
      const fallback = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        subdomains: "abc",
        crossOrigin: true,
        attribution: '&copy; OpenStreetMap contributors'
      });
      try { fallback.addTo(map); } catch {}
    });
    try { base.addTo(map); } catch {}
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapObj.current = map;
    requestAnimationFrame(() => { try { map.invalidateSize(); } catch {} });
    const onResize = () => { try { map.invalidateSize(); } catch {} };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [leafletReady, visible, center]);

  useEffect(() => {
    if (!leafletReady || !mapObj.current) return;
    const L = window.L as Leaflet;
    const map = mapObj.current as LeafletMap;
    const teal = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#24BFBF";
    const buildGroup = () => (clusterReady && L.markerClusterGroup ? L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 14,
      iconCreateFunction: (cluster: { getChildCount(): number }) => {
        const count = cluster.getChildCount();
        const html = `<div style="
          display:flex;align-items:center;justify-content:center;
          width:32px;height:32px;border-radius:9999px;
          background:${teal};color:white;font-weight:600;box-shadow:0 6px 18px rgba(0,0,0,.12);
        ">${count}</div>`;
        return L.divIcon({ html, className: "", iconSize: [32, 32] });
      },
    }) : L.layerGroup());
    const group: LayerGroup = buildGroup();
    const now = Date.now();
    const getColor = (mm: LiveMapMarker) => {
      const purple = "#9333EA"; // futuros
      const tealC = teal || "#24BFBF"; // acontecendo
      if (mm.status === "ongoing") return tealC;
      if (mm.status === "future") return purple;
      if (mm.start) {
        const s = Date.parse(mm.start);
        const e = mm.end ? Date.parse(mm.end) : s;
        if (!Number.isNaN(s)) {
          if (s <= now && now <= (Number.isNaN(e) ? s : e)) return tealC;
          if (s > now) return purple;
        }
      }
      return purple;
    };

    const useCircles = validMarkers.length <= 150 || !L.markerClusterGroup;
    validMarkers.forEach((m: LiveMapMarker) => {
      const color = getColor(m);
      let layer: unknown;
      if (useCircles && (L as unknown as { circleMarker?: unknown }).circleMarker) {
        const cm = (L as unknown as { circleMarker: (latlng: [number, number], opts: Record<string, unknown>) => unknown }).circleMarker([m.lat, m.lng], {
          radius: 6,
          color,
          weight: 2,
          opacity: 1,
          fillColor: `${color}33`,
          fillOpacity: 0.6,
        });
        // @ts-expect-error circle marker click
        cm.on?.('click', () => { window.location.href = `/events/${m.id}`; });
        layer = cm;
      } else {
        const icon = L.divIcon({
          className: "",
          html: `<div style=\"width:14px;height:14px;border-radius:9999px;border:2px solid ${color};background:${color}33\"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const marker = L.marker([m.lat, m.lng], { icon });
        marker.on('click', () => { window.location.href = `/events/${m.id}`; });
        layer = marker;
      }
      const uname = (m?.owner?.username || m?.ownerUsername || m?.username || "").toString();
      const showU = uname && uname.toLowerCase() !== "insecure";
      const content = `
        <div style="min-width:200px; font-size:12px; line-height:1.2">
          <div style="display:flex;align-items:center;gap:6px;font-weight:600;margin-bottom:2px">
            ${showU ? `<a href=\"/profile/${uname}\" class=\"agitto-username-chip\">@${uname}</a>` : ""}
            <span>${m.title}</span>
          </div>
          <div style=\"color:#6B7280\">${m.locationName || "Local a definir"}</div>
        </div>`;
      // @ts-expect-error bindTooltip on both marker/circle
      layer.bindTooltip?.(content, { direction: 'top', opacity: 1, sticky: true, className: 'agitto-map-tip', offset: [0, -8] });
      group.addLayer(layer);
    });
    // Defer adding group to after initial tiles, to avoid jank
    const addGroup = () => { try { group.addTo(map); } catch {} };
    setTimeout(addGroup, 0);
    if (validMarkers.length > 0) {
      try {
        const pairs = validMarkers.map((m: LiveMapMarker) => [m.lat, m.lng] as [number, number]);
        const bounds = L.latLngBounds(pairs);
        // @ts-expect-error Leaflet bounds validity check
        const ok = typeof bounds?.isValid === "function" ? bounds.isValid() : pairs.length > 0;
        if (ok) {
          const size = map.getSize();
          const padding = Math.min(size.x, size.y) * 0.15;
          map.fitBounds(bounds, { padding: [padding, padding], maxZoom: 13 });
          if (validMarkers.length === 1) map.setZoom(13);
        } else {
          map.setView([center.lat, center.lng], 5);
        }
      } catch {
        map.setView([center.lat, center.lng], 5);
      }
    } else {
      map.setView([center.lat, center.lng], 5);
    }
    return () => { group.clearLayers(); map.removeLayer(group); };
  }, [validMarkers, leafletReady, clusterReady, center]);

  // No filters; center via markers or default

  return (
    <Card className="p-5 space-y-3 border-transparent bg-white/70 backdrop-blur">
      <div className="px-1">
        <h2 className="text-lg font-semibold">Mapa ao vivo</h2>
      </div>
      <div className="relative rounded-2xl overflow-hidden ring-1 ring-black/5 bg-white/60 backdrop-blur">
        <div ref={mapRef} className="w-full h-64" />
        {!leafletReady && (
          <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Carregando mapa…</div>
        )}
        {leafletReady && isLoading && (
          <div className="absolute top-2 left-2 rounded-md bg-white/80 px-2 py-1 text-xs">Atualizando…</div>
        )}
        {leafletReady && !isLoading && validMarkers.length === 0 && (
          <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
            Nenhum evento público no momento
          </div>
        )}
      </div>
    </Card>
  );
}
