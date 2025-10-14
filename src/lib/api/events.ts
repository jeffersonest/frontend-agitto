import { http, getAccessToken } from "@/lib/api/http";
import { getApiBaseUrl } from "@/lib/config";

export type EventVisibility = "PUBLIC" | "PRIVATE";
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";

export interface EventEntity {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  visibility: EventVisibility;
  status: EventStatus;
  startDate: string;
  endDate: string | null;
  locationName: string | null;
  locationAddress: string | null;
  locationLat: number | null;
  locationLng: number | null;
  capacity: number | null;
  attendeeCount: number;
  likesCount?: number;
  interestedCount?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  distance?: number;
  isEnded?: boolean;
  owner?: {
    id: string;
    name?: string | null;
    avatarUrl?: string | null;
    profileImageUrl?: string | null;
    username?: string | null;
  };
  userInteraction?: {
    isGoing: boolean;
    isInterested: boolean;
    isLiked: boolean;
    isOwner: boolean;
  };
}

export interface CreateEventDto {
  title: string;
  description?: string;
  visibility: EventVisibility;
  startDate: string;
  endDate?: string;
  locationName?: string;
  locationAddress?: string;
  locationLat?: number;
  locationLng?: number;
  locationStreet?: string;
  locationNumber?: string;
  locationNeighborhood?: string;
  locationCity?: string;
  locationState?: string;
  locationZipCode?: string;
  locationCountry?: string;
  capacity?: number;
  tags?: string[];
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
  status?: EventStatus;
}

export interface FilterEventsDto {
  ownerId?: string;
  visibility?: EventVisibility;
  status?: EventStatus;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  locationCity?: string;
  locationState?: string;
  locationNeighborhood?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  skip?: number;
  take?: number;
}

export interface EventListResponse {
  events: EventEntity[];
  pagination: { total: number; skip: number; take: number };
}

export async function listEvents(params: FilterEventsDto = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) v.forEach((vv) => q.append(k, String(vv)));
    else q.append(k, String(v));
  }
  const qs = q.toString();
  return http<EventListResponse>(`/events${qs ? `?${qs}` : ""}`, { method: "GET" });
}

export async function getEvent(id: string) {
  return http<{ event: EventEntity }>(`/events/${id}`, { method: "GET" });
}

export async function createEvent(data: CreateEventDto) {
  return http<{ message: string; event: EventEntity }>(`/events`, { method: "POST", body: data, auth: true });
}

export async function updateEvent(id: string, data: UpdateEventDto) {
  return http<{ message: string; event: EventEntity }>(`/events/${id}`, { method: "PATCH", body: data, auth: true });
}

export async function deleteEvent(id: string) {
  return http<{ message: string }>(`/events/${id}`, { method: "DELETE", auth: true });
}

export async function uploadEventCover(id: string, file: File) {
  const base = getApiBaseUrl();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${base}/events/${id}/upload-cover`, {
    method: "POST",
    body: form,
    headers: (() => {
      const h: Record<string, string> = {};
      const token = getAccessToken();
      if (token) h["Authorization"] = `Bearer ${token}`;
      return h;
    })(),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(String(data?.message || res.statusText));
  return data as { message: string; imageUrl: string };
}

export interface LiveMapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  locationName?: string | null;
  owner?: { username?: string | null } | null;
  ownerUsername?: string | null;
  username?: string | null;
  start?: string;
  end?: string | null;
  // Optional hint from backend about temporal status
  status?: "past" | "ongoing" | "future";
}

export async function listLiveMap(params: Record<string, string | number | undefined> = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) q.append(k, String(v));
  });
  const qs = q.toString();
  return http<{ markers: LiveMapMarker[]; total: number }>(`/events/live-map${qs ? `?${qs}` : ""}`, { method: "GET" });
}

export interface DiscoverListResponse {
  events: EventEntity[];
  pagination: { skip: number; take: number; hasMore: boolean };
}

export async function listPopularWeek(params: { skip?: number; take?: number } = {}) {
  const q = new URLSearchParams();
  if (typeof params.skip === "number") q.append("skip", String(params.skip));
  if (typeof params.take === "number") q.append("take", String(params.take));
  const qs = q.toString();
  return http<DiscoverListResponse>(`/events/popular/week${qs ? `?${qs}` : ""}`, { method: "GET" });
}

export async function listTrending(params: { skip?: number; take?: number } = {}) {
  const q = new URLSearchParams();
  if (typeof params.skip === "number") q.append("skip", String(params.skip));
  if (typeof params.take === "number") q.append("take", String(params.take));
  const qs = q.toString();
  return http<DiscoverListResponse>(`/events/trending${qs ? `?${qs}` : ""}`, { method: "GET" });
}

export async function listDiscovery(params: { skip?: number; take?: number } = {}) {
  const q = new URLSearchParams();
  if (typeof params.skip === "number") q.append("skip", String(params.skip));
  if (typeof params.take === "number") q.append("take", String(params.take));
  const qs = q.toString();
  return http<{ total: number; events: EventEntity[] }>(`/events/discovery${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
}

export async function listFollowingFeed(params: { skip?: number; take?: number } = {}) {
  const q = new URLSearchParams();
  if (typeof params.skip === "number") q.append("skip", String(params.skip));
  if (typeof params.take === "number") q.append("take", String(params.take));
  const qs = q.toString();
  return http<{ total: number; events: EventEntity[] }>(`/feed/following${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
}

// Calendar API
export type MyCalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string | null;
  allDay?: boolean;
  rsvpStatus: "GOING" | "INTERESTED";
  status: "upcoming" | "ongoing" | "past";
  tags?: string[];
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  locationCity?: string | null;
  locationName?: string | null;
  locationAddress?: string | null;
  coverImageUrl?: string | null;
  owner?: { id: string; name?: string | null; username?: string | null; profileImageUrl?: string | null } | null;
};

export type MyCalendarResponse = {
  events: MyCalendarEvent[];
  eventsByDate: Record<string, { count: number; statuses: Array<"GOING" | "INTERESTED">; hasGoing: boolean; hasInterested: boolean; hasPast: boolean; hasOngoing: boolean }>;
  summary: { totalEvents: number; totalGoing: number; totalInterested: number; upcomingCount: number; ongoingCount: number; pastCount: number };
};

export async function getMyCalendar(params: { month?: string; rsvpStatus?: string } = {}) {
  const q = new URLSearchParams();
  if (params.month) q.append("month", params.month);
  if (params.rsvpStatus) q.append("rsvpStatus", params.rsvpStatus);
  const qs = q.toString();
  return http<MyCalendarResponse>(`/events/my-calendar${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
}
