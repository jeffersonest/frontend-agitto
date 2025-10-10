"use client";
import { getSportColorFromTags } from "@/lib/constants/sports";
import { MapPin, Bookmark } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type EventCardProps = {
  id: string;
  title: string;
  coverImageUrl?: string | null;
  tags: string[];
  startDate: string;
  locationCity?: string | null;
  locationState?: string | null;
  attendeeCount?: number;
  ownerName?: string;
  ownerAvatar?: string;
  onClick?: () => void;
};

export default function EventCard({
  title,
  coverImageUrl,
  tags,
  startDate,
  locationCity,
  locationState,
  attendeeCount = 0,
  ownerName,
  ownerAvatar,
  onClick,
}: EventCardProps) {
  const overlayColor = getSportColorFromTags(tags);
  const formattedDate = format(new Date(startDate), "dd MMM, yyyy", { locale: ptBR });

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white w-full max-w-[320px]"
    >
      <div className="relative h-56 overflow-hidden bg-gray-900">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            style={{ objectPosition: 'center center' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <span className="text-6xl font-bold text-white/30">
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlayColor }}
        />

        {tags.length > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-[#FF5722] text-white shadow-md">
              {tags[0].charAt(0).toUpperCase() + tags[0].slice(1)}
            </span>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-[#00BCD4] flex items-center justify-center hover:bg-[#00ACC1] transition-colors shadow-lg"
        >
          <Bookmark size={18} className="text-white" fill="white" />
        </button>
      </div>

      <div className="p-4 space-y-2.5">
        <div>
          <h3 className="font-bold text-base leading-snug line-clamp-1 text-gray-900 mb-1">
            {title}
          </h3>
          {ownerName && (
            <p className="text-xs text-gray-400">by {ownerName}</p>
          )}
        </div>

        <p className="text-sm text-gray-500">{formattedDate}</p>

        {(locationCity || locationState) && (
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-[#00BCD4] flex-shrink-0" />
            <p className="text-xs text-gray-500 line-clamp-1">
              {[locationCity, locationState].filter(Boolean).join(", ")}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex -space-x-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white shadow-sm"
              />
            ))}
          </div>
          {attendeeCount > 0 && (
            <span className="text-xs text-gray-400 font-medium">
              +{attendeeCount} outros vão
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
