"use client";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMyCalendar } from "@/lib/queries/events";

function fmtMonth(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function fmtDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function MyEventsCalendar() {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [selected, setSelected] = useState<Date>(() => new Date());
  const monthStr = fmtMonth(currentMonth);
  const { data } = useMyCalendar(monthStr);

  const firstDay = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), [currentMonth]);
  const start = useMemo(() => {
    const s = new Date(firstDay);
    const day = s.getDay();
    s.setDate(s.getDate() - day);
    return s;
  }, [firstDay]);
  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [start]);

  const eventsByDate = data?.eventsByDate || {};
  const events = data?.events || [];
  const selectedKey = fmtDateKey(selected);
  const eventsOnSelected = events.filter((e) => (e.start || "").startsWith(selectedKey));

  const monthLabel = currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const dow = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  function prevMonth() {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(d);
  }
  function nextMonth() {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d);
  }

  return (
    <div className="flex gap-6">
      <Card className="flex-1 p-4 ring-1 ring-black/5 bg-white/70 backdrop-blur">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold capitalize">{monthLabel}</div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={prevMonth}>{"<"}</Button>
            <Button size="sm" variant="secondary" onClick={nextMonth}>{">"}</Button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-xs text-muted-foreground mb-1">
          {dow.map((d) => (<div key={d} className="px-2 py-1 text-center">{d}</div>))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            const inMonth = d.getMonth() === currentMonth.getMonth();
            const key = fmtDateKey(d);
            const meta = eventsByDate[key];
            const isSelected = key === selectedKey;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(d)}
                className={
                  `h-16 rounded-md p-2 text-left ring-1 ring-black/5 ` +
                  (isSelected ? "bg-white shadow-sm" : "bg-white/70") +
                  (inMonth ? "" : " opacity-50")
                }
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{d.getDate()}</span>
                  {meta && (
                    <span className="inline-flex items-center gap-1">
                      {meta.hasOngoing && <span className="w-2 h-2 rounded-full bg-amber-300" />}
                      {meta.hasGoing && <span className="w-2 h-2 rounded-full bg-purple-600" />}
                      {meta.hasInterested && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#24BFBF" }} />}
                      {meta.hasPast && <span className="w-2 h-2 rounded-full bg-red-300" />}
                    </span>
                  )}
                </div>
                {meta && (
                  <div className="mt-2 text-[11px] text-muted-foreground">{meta.count} evento{meta.count > 1 ? "s" : ""}</div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex gap-4 text-xs">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-600" /> Eu vou!</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: "#24BFBF" }} /> Interesse</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-300" /> Hoje</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-300" /> Passado</div>
        </div>
      </Card>

      <Card className="w-80 p-4 ring-1 ring-black/5 bg-white/70 backdrop-blur">
        <h3 className="font-semibold mb-3 text-sm">Eventos em {selected.toLocaleDateString("pt-BR")}</h3>
        {eventsOnSelected.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum evento neste dia.</p>
        ) : (
          <div className="space-y-3">
            {eventsOnSelected.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="block p-3 rounded-lg ring-1 ring-black/5 bg-white/90 hover:bg-white">
                <div className="text-xs font-medium mb-1" style={{ color: event.color || event.backgroundColor || "#111" }}>
                  {event.rsvpStatus === "GOING" ? "✓ Eu vou!" : "⭐ Interesse"}
                </div>
                <div className="font-medium text-sm truncate">{event.title}</div>
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  {new Date(event.start).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  {event.locationName ? ` • ${event.locationName}` : ""}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

