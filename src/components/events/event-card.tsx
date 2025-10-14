"use client";
import { useRouter } from "next/navigation";
import { type MouseEvent } from "react";
import UsernameChip from "@/components/ui/username-chip";
import { MapPin, Pencil } from "lucide-react";
import { IconLike, IconInterest, IconGoing } from "@/components/ui/icons";
import { toggleLike, setRsvp, deleteRsvp } from "@/lib/api/social";
import { toast } from "sonner";
import { categoryColor, categoryEmoji, categoryFromTags, categoryTint } from "@/lib/events/category";
import { formatEventDate, formatLocationShort } from "@/lib/events/format";
import { useEventInteractions } from "@/lib/stores/eventInteractionsStore";

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
  isEnded?: boolean;
  badgePosition?: "top" | "bottom";
};

export default function EventCard({ id, title, startDate, locationName, locationAddress, coverImageUrl, tags, attendeeCount, ownerUsername, isEnded, badgePosition = "top" }: Props) {
  const router = useRouter();
  const cat = categoryFromTags(tags);
  const colorClass = categoryColor(cat);
  const tint = categoryTint(cat, 0.25);
  const dateText = formatEventDate(startDate);
  const localText = formatLocationShort(locationName || undefined, locationAddress || undefined);
  const showUsername = ownerUsername && ownerUsername.toLowerCase() !== "insecure" ? ownerUsername : null;

  const interaction = useEventInteractions((state) => state.interactions[id]);
  const updateInteraction = useEventInteractions((state) => state.updateInteraction);

  const liked = interaction?.isLiked ?? false;
  const isGoing = interaction?.isGoing ?? false;
  const isInterested = interaction?.isInterested ?? false;
  const isOwner = interaction?.isOwner ?? false;

  async function onToggleLike(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const prev = liked;

    updateInteraction(id, { isLiked: !prev });

    try {
      await toggleLike(id);
    } catch {
      updateInteraction(id, { isLiked: prev });
      toast.error("Falha ao curtir");
    }
  }

  async function onToggleInterest(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const prev = isInterested;

    try {
      if (isInterested) {
        updateInteraction(id, { isInterested: false, isGoing: false });
        await deleteRsvp(id);
      } else {
        updateInteraction(id, { isInterested: true, isGoing: false });
        await setRsvp(id, "INTERESTED");
      }
    } catch (error: unknown) {
      updateInteraction(id, { isInterested: prev });
      const err = error as { message?: string };
      const msg = err?.message || "";
      if (msg.includes("past event") || msg.includes("encerrado")) {
        toast.error("Este evento já foi encerrado");
      } else {
        toast.error("Falha ao atualizar interesse");
      }
    }
  }

  async function onToggleGoing(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const prev = isGoing;

    try {
      if (isGoing) {
        updateInteraction(id, { isGoing: false, isInterested: false });
        await deleteRsvp(id);
      } else {
        updateInteraction(id, { isGoing: true, isInterested: false });
        await setRsvp(id, "GOING");
      }
    } catch (error: unknown) {
      updateInteraction(id, { isGoing: prev });
      const err = error as { message?: string };
      const msg = err?.message || "";
      if (msg.includes("past event") || msg.includes("encerrado")) {
        toast.error("Este evento já foi encerrado");
      } else {
        toast.error("Falha ao atualizar participação");
      }
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
      <div className={`absolute ${badgePosition === "top" ? "top-3" : "bottom-3"} left-3 z-10 flex ${badgePosition === "top" ? "flex gap-2" : "items-center gap-2 flex-wrap"}`}>
        {showUsername && (
          <UsernameChip 
            username={showUsername} 
            mode="button" 
            variant="white" 
            size="xs"
            className={badgePosition === "bottom" ? "max-w-[90px] truncate" : ""}
          />
        )}
        <div className={badgePosition === "top" ? "flex items-center gap-2" : "contents"}>
          <span className={`rounded-full text-white text-xs px-2 py-0.5 flex items-center gap-1 whitespace-nowrap ${colorClass}`}>
            <span>{categoryEmoji(cat)}</span>
            <span>{cat}</span>
          </span>
          {isEnded && (
            <span className="rounded-full bg-gray-700 text-white text-xs px-2 py-0.5 font-medium whitespace-nowrap">
              Encerrado
            </span>
          )}
        </div>
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
          className="size-8 rounded-full bg-white/80 grid place-items-center hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Tenho interesse"
          onClick={onToggleInterest}
          title={isEnded ? "Evento encerrado" : "Tenho interesse"}
          disabled={isEnded}
        >
          <IconInterest active={isInterested} />
        </button>
        <button
          type="button"
          className="size-8 rounded-full bg-white/80 grid place-items-center hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Eu vou"
          onClick={onToggleGoing}
          title={isEnded ? "Evento encerrado" : "Eu vou"}
          disabled={isEnded}
        >
          <IconGoing active={isGoing} />
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
