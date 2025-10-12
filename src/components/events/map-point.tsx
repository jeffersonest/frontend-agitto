"use client";
import { useEffect, useRef, useState } from "react";

declare global { interface Window { L?: any } }

function useLeafletCore() {
  const [ready, setReady] = useState(false);
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

export default function MapPoint({ lat, lng, title, subtitle }: { lat: number; lng: number; title?: string; subtitle?: string }) {
  const ready = useLeafletCore();
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  useEffect(() => {
    if (!ready || !ref.current || mapRef.current) return;
    const L = window.L!;
    const map = L.map(ref.current, { zoomControl: false, attributionControl: false }).setView([lat, lng], 14);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    const teal = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#24BFBF";
    const icon = L.divIcon({ className: "", html: `<div style="width:14px;height:14px;border-radius:9999px;border:2px solid ${teal};background:${teal}33"></div>`, iconSize: [14,14], iconAnchor: [7,7] });
    const m = L.marker([lat, lng], { icon }).addTo(map);
    if (title || subtitle) {
      const html = `<div style="min-width:180px; font-size:12px; line-height:1.2"><div style="font-weight:600; margin-bottom:2px">${title || "Local do evento"}</div><div style="color:#6B7280">${subtitle || ""}</div></div>`;
      m.bindTooltip(html, { direction: 'top', opacity: 1, sticky: true, className: 'agitto-map-tip', offset: [0, -8] });
    }
    mapRef.current = map;
  }, [ready, lat, lng, title, subtitle]);

  return <div ref={ref} className="w-full h-72 rounded-xl overflow-hidden ring-1 ring-black/5 bg-white/60 backdrop-blur" />;
}

