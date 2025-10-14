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
  
  const svgIcons = useMemo(() => ({
    ongoing: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="6" cy="6" r="6" fill="#24BFBF"/>
                <circle cx="6" cy="6" r="3" fill="white"/>
              </svg>`,
    future: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
               <circle cx="6" cy="6" r="5" stroke="#A78BFA" stroke-width="2" fill="none"/>
               <circle cx="6" cy="6" r="2" fill="#A78BFA"/>
             </svg>`,
    calendar: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <rect x="1" y="2" width="10" height="9" rx="1" stroke="#6b7280" stroke-width="1" fill="none"/>
                 <line x1="3" y1="0" x2="3" y2="3" stroke="#6b7280" stroke-width="1"/>
                 <line x1="9" y1="0" x2="9" y2="3" stroke="#6b7280" stroke-width="1"/>
                 <line x1="1" y1="5" x2="11" y2="5" stroke="#6b7280" stroke-width="1"/>
               </svg>`,
    location: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M6 0C3.5 0 1.5 2 1.5 4.5c0 3.5 4.5 7.5 4.5 7.5s4.5-4 4.5-7.5C10.5 2 8.5 0 6 0zm0 6.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="#6b7280"/>
               </svg>`,
    people: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
               <circle cx="4" cy="3" r="2" stroke="#6b7280" stroke-width="1" fill="none"/>
               <circle cx="8" cy="3" r="2" stroke="#6b7280" stroke-width="1" fill="none"/>
               <path d="M0 11c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#6b7280" stroke-width="1" fill="none"/>
               <path d="M4 11c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#6b7280" stroke-width="1" fill="none"/>
             </svg>`
  }), []);
  
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
        const size = count < 10 ? 28 : count < 100 ? 32 : 36;
        const html = `<div style="
          display:flex;align-items:center;justify-content:center;
          width:${size}px;height:${size}px;border-radius:9999px;
          background:${teal};color:white;font-weight:600;box-shadow:0 6px 18px rgba(0,0,0,.12);
          font-size:${Math.max(10, size * 0.4)}px;
          transform: translateZ(0);
        ">${count}</div>`;
        return L.divIcon({ html, className: "", iconSize: [size, size] });
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
      const isOngoing = m.status === "ongoing";
      let layer: unknown;
      
      if (useCircles && (L as unknown as { circleMarker?: unknown }).circleMarker) {
        const cm = (L as unknown as { circleMarker: (latlng: [number, number], opts: Record<string, unknown>) => unknown }).circleMarker([m.lat, m.lng], {
          radius: isOngoing ? 8 : 6,
          color,
          weight: isOngoing ? 3 : 2,
          opacity: 1,
          fillColor: isOngoing ? color : `${color}66`,
          fillOpacity: isOngoing ? 0.8 : 0.6,
          className: isOngoing ? 'agitto-marker-ongoing' : 'agitto-marker-future',
        });
        // @ts-expect-error circle marker click
        cm.on?.('click', () => { window.location.href = `/events/${m.id}`; });
        layer = cm;
      } else {
        const pulseClass = isOngoing ? 'agitto-marker-pulse' : '';
        const icon = L.divIcon({
          className: `agitto-custom-marker ${pulseClass}`,
          html: `
            <div style="
              width: ${isOngoing ? '18px' : '14px'}; 
              height: ${isOngoing ? '18px' : '14px'}; 
              border-radius: 50%; 
              border: ${isOngoing ? '3px' : '2px'} solid ${color}; 
              background: ${isOngoing ? color : `${color}66`}; 
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              transition: all 0.3s ease;
              cursor: pointer;
            "></div>
          `,
          iconSize: [isOngoing ? 18 : 14, isOngoing ? 18 : 14],
          iconAnchor: [isOngoing ? 9 : 7, isOngoing ? 9 : 7],
        });
        const marker = L.marker([m.lat, m.lng], { icon });
        marker.on('click', () => { window.location.href = `/events/${m.id}`; });
        layer = marker;
      }
      const uname = (m?.owner?.username || m?.ownerUsername || m?.username || "").toString();
      const showU = uname && uname.toLowerCase() !== "insecure";
      
      const formatEventTime = (startDate: string) => {
        const start = new Date(startDate);
        const now = new Date();
        const isToday = start.toDateString() === now.toDateString();
        const isTomorrow = start.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
        
        let dateStr = "";
        if (isToday) {
          dateStr = "Hoje";
        } else if (isTomorrow) {
          dateStr = "Amanhã";
        } else {
          dateStr = start.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit' 
          });
        }
        
        const timeStr = start.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        return `${dateStr} às ${timeStr}`;
      };

      const eventTime = m.start ? formatEventTime(m.start) : "Horário a definir";
      
      const statusIcon = m.status === "ongoing" ? svgIcons.ongoing : svgIcons.future;
      const statusText = m.status === "ongoing" ? "Acontecendo agora" : "Próximo evento";
      
      const content = `
        <div style="min-width:240px; max-width:320px; font-size:13px; line-height:1.5; font-family: system-ui, -apple-system, sans-serif;">
          <div style="margin-bottom: 12px;">
            <div style="font-weight: 600; font-size: 14px; color: #1f2937; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${m.title}
            </div>
            ${showU ? `
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                <span style="font-size: 11px; color: #6b7280;">por</span>
                <a href="/profile/${uname}" style="
                  display: inline-flex; 
                  align-items: center; 
                  gap: 3px;
                  background: linear-gradient(135deg, #24BFBF 0%, #A78BFA 100%); 
                  color: white; 
                  padding: 4px 8px; 
                  border-radius: 8px; 
                  text-decoration: none; 
                  font-size: 11px; 
                  font-weight: 500;
                  transition: all 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                  @${uname}
                </a>
              </div>
            ` : ""}
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              ${statusIcon}
              <span style="font-size: 11px; color: ${m.status === "ongoing" ? "#24BFBF" : "#A78BFA"}; font-weight: 500;">
                ${statusText}
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; color: #374151; font-size: 12px;">
              ${svgIcons.calendar}
              <span>${eventTime}</span>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 12px; margin-bottom: 8px;">
            ${svgIcons.location}
            <span style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">
              ${m.locationName || "Local a definir"}
            </span>
          </div>
          
          ${(m as LiveMapMarker & { attendeeCount?: number })?.attendeeCount ? `
            <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 12px; margin-bottom: 8px;">
              ${svgIcons.people}
              <span>${(m as LiveMapMarker & { attendeeCount?: number }).attendeeCount} pessoas confirmadas</span>
            </div>
          ` : ""}
          
          <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <div style="font-size: 10px; color: #9ca3af; text-align: center;">
              Clique para ver detalhes
            </div>
          </div>
        </div>`;
      // @ts-expect-error bindTooltip on both marker/circle
      layer.bindTooltip?.(content, { 
        direction: 'top', 
        opacity: 1, 
        sticky: true, 
        className: 'agitto-map-tip-enhanced', 
        offset: [0, -12],
        permanent: false,
        interactive: true
      });
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
  }, [validMarkers, leafletReady, clusterReady, center, svgIcons]);

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
