import { http } from "@/lib/api/http";

export type Notification = {
  id: string;
  userId: string;
  type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION" | "SYSTEM" | "EVENT" | "SOCIAL";
  status: "ACTIVE" | "READ" | "COMPLETED";
  title: string;
  message: string;
  actionUrl: string | null;
  metadata: unknown;
  createdAt: string;
  readAt: string | null;
  completedAt: string | null;
};

export async function listActiveNotifications() {
  return http<Notification[]>("/notifications", { method: "GET", auth: true });
}

export async function listReadNotifications() {
  return http<Notification[]>("/notifications/read", { method: "GET", auth: true });
}

export async function markNotificationRead(id: string) {
  return http<Notification>(`/notifications/${id}/read`, { method: "PATCH", auth: true });
}

export async function completeNotification(id: string) {
  return http<{ message: string }>(`/notifications/${id}/complete`, { method: "PATCH", auth: true });
}
