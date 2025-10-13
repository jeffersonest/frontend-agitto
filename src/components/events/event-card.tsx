"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, type MouseEvent } from "react";
import UsernameChip from "@/components/ui/username-chip";
import { MapPin, Pencil } from "lucide-react";
import { IconLike, IconInterest, IconGoing } from "@/components/ui/icons";
import { toggleLike, setRsvp, deleteRsvp } from "@/lib/api/social";
import { toast } from "sonner";
import { categoryColor, categoryEmoji, categoryFromTags, categoryTint } from "@/lib/events/category";
import { formatEventDate, formatLocationShort } from "@/lib/events/format";
import { useQueryClient } from "@tanstack/react-query";
import { patchEventInCaches } from "@/lib/events/cache";

type Props = {
  id: string;
  title: string;
  startDate?: string;
  locationName?: string | null;
  locationAddress?: string | null;
  coverImageUrl?: string | null;
  tags?: string[];
  attendeeCount?: number;
  isOwner?: boolean;
  ownerUsername?: string | null;
  likedByMe?: boolean;
  rsvpStatus?: "GOING" | "INTERESTED" | "DECLINED" | null;
};

export default function EventCard({ id, title, startDate, locationName, locationAddress, coverImageUrl, tags, attendeeCount, isOwner, ownerUsername, likedByMe, rsvpStatus }: Props) {
  const router = useRouter();
  const cat = categoryFromTags(tags);
  const colorClass = categoryColor(cat);
  const tint = categoryTint(cat, 0.25);
  const dateText = formatEventDate(startDate);
  const localText = formatLocationShort(locationName || undefined, locationAddress || undefined);
  const showUsername = ownerUsername && ownerUsername.toLowerCase() !== "insecure" ? ownerUsername : null;
  const [liked, setLiked] = useState<boolean>(Boolean(likedByMe));
  const [rsvp, setRsvpState] = useState<"GOING" | "INTERESTED" | "DECLINED" | null>(rsvpStatus ?? null);
  const qc = useQueryClient();

  // Sync local state when server props change (initial load/refetch)
  useEffect(() => {
    setLiked(Boolean(likedByMe));
  }, [likedByMe]);
  useEffect(() => {
    setRsvpState(rsvpStatus ?? null);
  }, [rsvpStatus]);

  async function onToggleLike(e: MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    const prev = liked;
    setLiked(!prev);
    try {
      await toggleLike(id);
      patchEventInCaches(qc, id, (ev) => ({
        ...ev,
        viewer: { ...(ev.viewer || {}), likedByMe: !prev },
      }));
    } catch {
      setLiked(prev);
      toast.error("Falha ao curtir");
    }
  }

  async function onToggleInterest(e: MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    const prev = rsvp;
    try {
      if (rsvp === "INTERESTED") {
        setRsvpState(null);
        await deleteRsvp(id);
        patchEventInCaches(qc, id, (ev) => ({ ...ev, viewer: { ...(ev.viewer || {}), rsvpStatus: null } }));
      } else {
        setRsvpState("INTERESTED");
        await setRsvp(id, "INTERESTED");
        patchEventInCaches(qc, id, (ev) => ({ ...ev, viewer: { ...(ev.viewer || {}), rsvpStatus: "INTERESTED" } }));
      }
    } catch {
      setRsvpState(prev);
      toast.error("Falha ao atualizar interesse");
    }
  }

  async function onToggleGoing(e: MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    const prev = rsvp;
    try {
      if (rsvp === "GOING") {
        setRsvpState(null);
        await deleteRsvp(id);
        patchEventInCaches(qc, id, (ev) => ({ ...ev, viewer: { ...(ev.viewer || {}), rsvpStatus: null } }));
      } else {
        setRsvpState("GOING");
        await setRsvp(id, "GOING");
        patchEventInCaches(qc, id, (ev) => ({ ...ev, viewer: { ...(ev.viewer || {}), rsvpStatus: "GOING" } }));
      }
    } catch {
      setRsvpState(prev);
      toast.error("Falha ao atualizar participação");
    }
  }
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/events/${id}`)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/events/${id}`); } }}
      className="group relative cursor-pointer rounded-2xl overflow-hidden border-transparent ring-1 ring-black/5 bg-secondary/20 backdrop-blur hover:shadow-md transition-shadow"
    >
      <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : "none" }} />
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), ${tint}` }} />
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        {showUsername && (
          <UsernameChip username={showUsername} mode="button" variant="white" size="xs" />
        )}
        <span className={`rounded-full text-white text-xs px-2 py-0.5 flex items-center gap-1 ${colorClass}`}>
          <span>{categoryEmoji(cat)}</span>
          <span>{cat}</span>
        </span>
      </div>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {isOwner && (
          <button
            type="button"
            title="Editar"
            className="size-8 rounded-full bg-white/80 text-foreground grid place-items-center hover:bg-white transition-colors"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/events/${id}/edit`); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); router.push(`/events/${id}/edit`); } }}
          >
            <Pencil size={16} />
          </button>
        )}
        <button
          type="button"
          className="size-8 rounded-full bg-white/80 grid place-items-center hover:bg-white transition-colors"
          aria-label="Curtir"
          onClick={onToggleLike}
          title="Curtir"
        >
          <IconLike active={liked} />
        </button>
        <button
          type="button"
          className="size-8 rounded-full bg-white/80 grid place-items-center hover:bg-white transition-colors"
          aria-label="Tenho interesse"
          onClick={onToggleInterest}
          title="Tenho interesse"
        >
          <IconInterest active={rsvp === "INTERESTED"} />
        </button>
        <button
          type="button"
          className="size-8 rounded-full bg-white/80 grid place-items-center hover:bg-white transition-colors"
          aria-label="Eu vou"
          onClick={onToggleGoing}
          title="Eu vou"
        >
          <IconGoing active={rsvp === "GOING"} />
        </button>
      </div>
      <div className="relative p-4 h-72 flex flex-col justify-end min-h-36">
        <div className="bg-white/95 backdrop-blur rounded-xl p-3 shadow-sm min-h-[144px] flex flex-col">
          <div>
            <div className="font-semibold text-sm line-clamp-1">{title}</div>
            {dateText && <div className="text-xs text-muted-foreground mt-1">{dateText}</div>}
          </div>
          <div className="mt-auto">
            <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/70 ${localText ? "" : "opacity-0"}`}>
              <MapPin size={14} className="text-[color:var(--primary)]" />
              <span className="line-clamp-1">{localText || "Local"}</span>
            </div>
            {(() => {
              const count = typeof attendeeCount === "number" ? attendeeCount : 0;
              return (
                <div className={`mt-2 text-xs text-muted-foreground ${count < 1 ? "opacity-0" : ""}`}>+{count} pessoas vão</div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
