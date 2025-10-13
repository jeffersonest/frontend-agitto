import { http } from "@/lib/api/http";
import type { EventEntity } from "@/lib/api/events";

export async function getPublicProfile(username: string) {
  return http<{ user: { id: string; name: string; username: string; bio?: string | null; profileImageUrl?: string | null }, stats?: { eventsCreated?: number; eventsAttending?: number; eventsAttended?: number; followers?: number; following?: number }, isFollowing?: boolean }>(`/users/${encodeURIComponent(username)}/profile`, { method: "GET", auth: true });
}

export async function listUserFollowers(userId: string, params: { skip?: number; take?: number } = {}) {
  const q = new URLSearchParams();
  if (params.skip !== undefined) q.append("skip", String(params.skip));
  if (params.take !== undefined) q.append("take", String(params.take));
  const qs = q.toString();
  return http<{ total: number; followers: Array<{ id: string; createdAt: string; user: { id: string; name: string; username: string | null; profileImageUrl: string | null; bio?: string | null } }> }>(`/users/${userId}/followers${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
}

export async function listUserFollowing(userId: string, params: { skip?: number; take?: number } = {}) {
  const q = new URLSearchParams();
  if (params.skip !== undefined) q.append("skip", String(params.skip));
  if (params.take !== undefined) q.append("take", String(params.take));
  const qs = q.toString();
  return http<{ total: number; following: Array<{ id: string; createdAt: string; user: { id: string; name: string; username: string | null; profileImageUrl: string | null; bio?: string | null } }> }>(`/users/${userId}/following${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
}

export async function listUserEventsInterested(userId: string, params: { skip?: number; take?: number } = {}) {
  const q = new URLSearchParams();
  if (params.skip !== undefined) q.append("skip", String(params.skip));
  if (params.take !== undefined) q.append("take", String(params.take));
  const qs = q.toString();
  return http<{ total: number; events: EventEntity[] }>(`/users/${userId}/events/interested${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
}

export async function listUserEventsAttended(userId: string, params: { skip?: number; take?: number } = {}) {
  const q = new URLSearchParams();
  if (params.skip !== undefined) q.append("skip", String(params.skip));
  if (params.take !== undefined) q.append("take", String(params.take));
  const qs = q.toString();
  return http<{ total: number; events: EventEntity[] }>(`/users/${userId}/events/attended${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
}
