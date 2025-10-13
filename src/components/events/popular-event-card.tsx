"use client";
import Link from "next/link";
import UsernameChip from "@/components/ui/username-chip";
import { MapPin, Users } from "lucide-react";
import { categoryFromTags, categoryColorHex, categoryEmoji } from "@/lib/events/category";
import { formatEventDate, formatLocationShort } from "@/lib/events/format";
import { useState, useEffect, type MouseEvent } from "react";
import { IconLike, IconInterest, IconGoing } from "@/components/ui/icons";
import { toggleLike, setRsvp, deleteRsvp } from "@/lib/api/social";
import { toast } from "sonner";
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
  ownerUsername?: string | null;
  likedByMe?: boolean;
  rsvpStatus?: "GOING" | "INTERESTED" | "DECLINED" | null;
};

export default function PopularEventCard({
  id,
  title,
  startDate,
  locationName,
  locationAddress,
  coverImageUrl,
  tags,
  attendeeCount,
  ownerUsername,
  likedByMe,
  rsvpStatus
}: Props) {
  const category = categoryFromTags(tags);
  const sportColor = categoryColorHex(category);
  const emoji = categoryEmoji(category);
  const dateText = formatEventDate(startDate);
  const localText = formatLocationShort(locationName || undefined, locationAddress || undefined);
  const showUsername = ownerUsername && ownerUsername.toLowerCase() !== "insecure" ? ownerUsername : null;
  const [liked, setLiked] = useState<boolean>(Boolean(likedByMe));
  const [rsvp, setRsvpState] = useState<"GOING" | "INTERESTED" | "DECLINED" | null>(rsvpStatus ?? null);
  const qc = useQueryClient();

  // Sync local state from server props on initial fetch/refetch
  useEffect(() => { setLiked(Boolean(likedByMe)); }, [likedByMe]);
  useEffect(() => { setRsvpState(rsvpStatus ?? null); }, [rsvpStatus]);

  async function onToggleLike(e: MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    const prev = liked;
    setLiked(!prev);
    try {
      await toggleLike(id);
      patchEventInCaches(qc, id, (ev) => ({ ...ev, viewer: { ...(ev.viewer || {}), likedByMe: !prev } }));
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
    <Link
      href={`/events/${id}`}
      className="group block rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white"
    >
      <div
        className="relative h-40 bg-gradient-to-br from-purple-600 to-purple-400 overflow-hidden"
        style={{ backgroundColor: sportColor }}
      >
        {coverImageUrl ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundImage: `url(${coverImageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/30">
            <div className="text-6xl">{emoji}</div>
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2">
          {showUsername && (
            <UsernameChip username={showUsername} mode="button" variant="white" size="xs" />
          )}
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-medium capitalize"
            style={{ backgroundColor: sportColor }}
          >
            <span>{emoji}</span>
            <span>{category}</span>
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            type="button"
            className="size-8 rounded-full bg-white/80 grid place-items-center hover:bg-white"
            aria-label="Curtir"
            title="Curtir"
            onClick={onToggleLike}
          >
            <IconLike active={liked} />
          </button>
          <button
            type="button"
            className="size-8 rounded-full bg-white/80 grid place-items-center hover:bg-white"
            aria-label="Tenho interesse"
            title="Tenho interesse"
            onClick={onToggleInterest}
          >
            <IconInterest active={rsvp === "INTERESTED"} />
          </button>
          <button
            type="button"
            className="size-8 rounded-full bg-white/80 grid place-items-center hover:bg-white"
            aria-label="Eu vou"
            title="Eu vou"
            onClick={onToggleGoing}
          >
            <IconGoing active={rsvp === "GOING"} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2 min-h-36">
        <h3 className="font-semibold text-sm line-clamp-2 leading-tight min-h-[2.5rem]">
          {title}
        </h3>

        {dateText && (
          <div className="text-xs text-muted-foreground">
            📅 {dateText}
          </div>
        )}

        {localText && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={12} className="text-[color:var(--primary)] shrink-0" />
            <span className="line-clamp-1">{localText}</span>
          </div>
        )}

        {typeof attendeeCount === "number" && attendeeCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-purple-700">
            <Users size={12} />
            <span>+{attendeeCount} pessoas vão</span>
          </div>
        )}
      </div>
    </Link>
  );
}
