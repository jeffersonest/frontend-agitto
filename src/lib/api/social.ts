import { http } from "@/lib/api/http";

export type RsvpStatus = "GOING" | "INTERESTED" | "DECLINED";

export async function setRsvp(eventId: string, status: RsvpStatus) {
  return http(`/events/${eventId}/rsvp`, { method: "POST", body: { status }, auth: true });
}

export async function deleteRsvp(eventId: string) {
  return http(`/events/${eventId}/rsvp`, { method: "DELETE", auth: true });
}

export async function listAttendees(eventId: string, status?: RsvpStatus) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return http<Array<{ id: string; status: RsvpStatus; createdAt: string; user: { id: string; name: string; username: string | null; profileImageUrl: string | null } }>>(
    `/events/${eventId}/attendees${q}`,
    { method: "GET", auth: true }
  );
}

export async function toggleLike(eventId: string) {
  return http<{ liked: boolean; message: string }>(`/events/${eventId}/like`, { method: "POST", auth: true });
}

export async function listLikes(eventId: string, params: { skip?: number; take?: number } = {}) {
  const q = new URLSearchParams();
  if (params.skip !== undefined) q.append("skip", String(params.skip));
  if (params.take !== undefined) q.append("take", String(params.take));
  const qs = q.toString();
  return http<{ total: number; likes: Array<{ id: string; createdAt: string; user: { id: string; name: string; username: string | null; profileImageUrl: string | null } }> }>(
    `/events/${eventId}/likes${qs ? `?${qs}` : ""}`,
    { method: "GET", auth: true }
  );
}

export async function listComments(eventId: string, params: { skip?: number; take?: number } = {}) {
  const q = new URLSearchParams();
  if (params.skip !== undefined) q.append("skip", String(params.skip));
  if (params.take !== undefined) q.append("take", String(params.take));
  const qs = q.toString();
  return http<{ total: number; comments: Array<{ id: string; content: string; createdAt: string; editedAt: string | null; user: { id: string; name: string; username: string | null; profileImageUrl: string | null } }> }>(
    `/events/${eventId}/comments${qs ? `?${qs}` : ""}`,
    { method: "GET", auth: true }
  );
}

export async function createComment(eventId: string, content: string) {
  return http<{ id: string; eventId: string; userId: string; content: string; createdAt: string }>(
    `/events/${eventId}/comments`,
    { method: "POST", body: { content }, auth: true }
  );
}

export async function updateComment(commentId: string, content: string) {
  return http<{ id: string; content: string; editedAt: string }>(`/comments/${commentId}`, { method: "PATCH", body: { content }, auth: true });
}

export async function deleteComment(commentId: string) {
  return http<{ message: string }>(`/comments/${commentId}`, { method: "DELETE", auth: true });
}

export async function toggleFollow(userId: string) {
  return http<{ following: boolean; message: string }>(`/users/${userId}/follow`, { method: "POST", auth: true });
}

export async function getFollowers(userId: string, params: { skip?: number; take?: number } = {}) {
  const q = new URLSearchParams();
  if (params.skip !== undefined) q.append("skip", String(params.skip));
  if (params.take !== undefined) q.append("take", String(params.take));
  const qs = q.toString();
  return http<{ total: number; followers: Array<{ id: string; followerId: string; followingId: string; createdAt: string; user: { id: string; name: string; username: string | null; profileImageUrl: string | null; bio: string | null } }> }>(
    `/users/${userId}/followers${qs ? `?${qs}` : ""}`,
    { method: "GET", auth: true }
  );
}

export async function getFollowing(userId: string, params: { skip?: number; take?: number } = {}) {
  const q = new URLSearchParams();
  if (params.skip !== undefined) q.append("skip", String(params.skip));
  if (params.take !== undefined) q.append("take", String(params.take));
  const qs = q.toString();
  return http<{ total: number; following: Array<{ id: string; followerId: string; followingId: string; createdAt: string; user: { id: string; name: string; username: string | null; profileImageUrl: string | null; bio: string | null } }> }>(
    `/users/${userId}/following${qs ? `?${qs}` : ""}`,
    { method: "GET", auth: true }
  );
}

export async function getFollowStats(userId: string) {
  return http<{ followers: number; following: number }>(`/users/${userId}/follow-stats`, { method: "GET", auth: true });
}

export async function searchUsers(query: string, params: { skip?: number; take?: number } = {}) {
  const q = new URLSearchParams();
  q.append("q", query);
  if (params.skip !== undefined) q.append("skip", String(params.skip));
  if (params.take !== undefined) q.append("take", String(params.take));
  return http<{ total: number; users: Array<{ id: string; name: string; username: string | null; profileImageUrl: string | null; bio: string | null; followersCount: number; followingCount: number; isFollowing: boolean }> }>(
    `/users/search?${q.toString()}`,
    { method: "GET", auth: false }
  );
}

