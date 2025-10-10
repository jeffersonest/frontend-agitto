"use client";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
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
};

export default function EventCard({ id, title, startDate, locationName, locationAddress, coverImageUrl, tags, attendeeCount }: Props) {
  const cat = categoryFromTags(tags);
  const color = categoryColor(cat);
  const tint = categoryTint(cat, 0.25);
  const dateText = formatEventDate(startDate);
  const localText = formatLocationShort(locationName || undefined, locationAddress || undefined);
  return (
    <Link href={`/events/${id}`} className="group relative rounded-2xl overflow-hidden border bg-secondary/30 hover:shadow-lg transition-shadow">
      <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : "none" }} />
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), ${tint}` }} />
      <div className="absolute top-3 left-3">
        <span className="rounded-full text-white text-xs px-2 py-0.5 flex items-center gap-1" style={{ backgroundColor: color }}>
          <span>{categoryEmoji(cat)}</span>
          <span>{cat}</span>
        </span>
      </div>
      <div className="absolute top-3 right-3">
        <button type="button" className="size-8 rounded-full bg-white/80 text-foreground grid place-items-center hover:bg-white transition-colors">
          <Star size={16} />
        </button>
      </div>
      <div className="relative p-4 h-64 flex flex-col justify-end">
        <div className="bg-white/95 backdrop-blur rounded-xl p-3 shadow-sm">
          <div className="font-semibold text-sm line-clamp-1">{title}</div>
          {dateText && <div className="text-xs text-muted-foreground mt-1">{dateText}</div>}
          {localText && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/70">
              <MapPin size={14} className="text-[color:var(--primary)]" />
              <span className="line-clamp-1">{localText}</span>
            </div>
          )}
          {typeof attendeeCount === "number" && (
            <div className="mt-2 text-xs text-muted-foreground">+{attendeeCount} pessoas vão</div>
          )}
        </div>
      </div>
    </Link>
  );
}

