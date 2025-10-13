import type { QueryClient } from "@tanstack/react-query";

type EventLike = { id: string } & Record<string, unknown>;
type Updater = (ev: EventLike) => EventLike;

function isEventLike(o: unknown): o is EventLike {
  return Boolean(o) && typeof o === "object" && "id" in (o as Record<string, unknown>);
}

function updateEventsArray(arr: unknown, updater: Updater): unknown {
  if (!Array.isArray(arr)) return arr;
  let changed = false;
  const next = arr.map((it) => {
    if (isEventLike(it)) {
      const res = updater(it);
      if (res !== it) changed = true;
      return res;
    }
    return it;
  });
  return changed ? next : arr;
}

function patchData(data: unknown, updater: Updater): unknown {
  if (!data) return data;
  let nextData: unknown = data;

  // Shape: { events: [...] }
  if (typeof (data as Record<string, unknown>)?.events !== "undefined") {
    const d = data as { events?: unknown } & Record<string, unknown>;
    const nextEvents = updateEventsArray(d.events, updater);
    if (nextEvents !== d.events) {
      nextData = { ...(data as object), events: nextEvents };
    }
  }

  // Shape: { pages: [{ events: [...] }, ...] }
  if (Array.isArray((data as Record<string, unknown>)?.pages)) {
    const d = data as { pages: Array<Record<string, unknown>> };
    const nextPages = d.pages.map((p) => {
      if (typeof p.events !== "undefined") {
        const next = updateEventsArray(p.events, updater);
        if (next !== p.events) return { ...p, events: next };
      }
      return p;
    });
    if (nextPages !== d.pages) {
      nextData = { ...(nextData as object), pages: nextPages };
    }
  }

  // Shape: { event: {...} }
  if (isEventLike((data as Record<string, unknown>)?.event)) {
    const d = data as { event: EventLike };
    const patched = updater(d.event);
    if (patched !== d.event) {
      nextData = { ...(nextData as object), event: patched };
    }
  }

  return nextData;
}

export function patchEventInCaches(qc: QueryClient, eventId: string, apply: Updater) {
  const entries = qc.getQueriesData<unknown>({ queryKey: ["events"] as const });
  for (const [key, data] of entries) {
    if (!data) continue;
    const next = patchData(data, (ev) => (String(ev.id) === String(eventId) ? apply(ev) : ev));
    if (next !== data) qc.setQueryData(key, next);
  }
}
