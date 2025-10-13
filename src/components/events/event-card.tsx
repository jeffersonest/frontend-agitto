"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UsernameChip from "@/components/ui/username-chip";
import { MapPin, Star, Pencil } from "lucide-react";
import { categoryColor, categoryEmoji, categoryFromTags, categoryTint } from "@/lib/events/category";
import { formatEventDate, formatLocationShort } from "@/lib/events/format";

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
};

export default function EventCard({ id, title, startDate, locationName, locationAddress, coverImageUrl, tags, attendeeCount, isOwner, ownerUsername }: Props) {
  const router = useRouter();
  const cat = categoryFromTags(tags);
  const color = categoryColor(cat);
  const tint = categoryTint(cat, 0.25);
  const dateText = formatEventDate(startDate);
  const localText = formatLocationShort(locationName || undefined, locationAddress || undefined);
  const showUsername = ownerUsername && ownerUsername.toLowerCase() !== "insecure" ? ownerUsername : null;
  return (
    <Link href={`/events/${id}`} className="group relative rounded-2xl overflow-hidden border-transparent ring-1 ring-black/5 bg-secondary/20 backdrop-blur hover:shadow-md transition-shadow">
      <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : "none" }} />
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), ${tint}` }} />
      <div className="absolute top-3 left-3 flex items-center gap-2">
        {showUsername && (
          <UsernameChip username={showUsername} mode="button" variant="white" size="xs" />
        )}
        <span className="rounded-full text-white text-xs px-2 py-0.5 flex items-center gap-1" style={{ backgroundColor: color }}>
          <span>{categoryEmoji(cat)}</span>
          <span>{cat}</span>
        </span>
      </div>
      <div className="absolute top-3 right-3 flex items-center gap-2">
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
          className="size-8 rounded-full bg-white/80 text-foreground grid place-items-center hover:bg-white transition-colors"
          aria-label="Salvar"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* futuro: toggle favorito */ }}
        >
          <Star size={16} />
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
    </Link>
  );
}
