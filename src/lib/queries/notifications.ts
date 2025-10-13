"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeNotification, listActiveNotifications, listReadNotifications, markNotificationRead, Notification } from "@/lib/api/notifications";

export const notificationKeys = {
  all: ["notifications"] as const,
  active: () => [...notificationKeys.all, "active"] as const,
  read: () => [...notificationKeys.all, "read"] as const,
};

export function useActiveNotifications() {
  return useQuery({
    queryKey: notificationKeys.active(),
    queryFn: listActiveNotifications,
    refetchInterval: 60_000,
  });
}

export function useReadNotifications() {
  return useQuery({
    queryKey: notificationKeys.read(),
    queryFn: listReadNotifications,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.active() });
      qc.invalidateQueries({ queryKey: notificationKeys.read() });
    },
  });
}

export function useCompleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeNotification(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.active() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  const markOne = (id: string) => markNotificationRead(id);
  return useMutation({
    mutationFn: async (ids?: string[]) => {
      const cache = qc.getQueryData<Notification[]>(notificationKeys.active());
      const source = ids && ids.length ? (cache || []).filter((n) => ids.includes(n.id)) : (cache || []);
      const target = source.filter((n) => n.type !== "EMAIL_VERIFICATION" && n.type !== "PHONE_VERIFICATION").map((n) => n.id);
      await Promise.allSettled(target.map((id) => markOne(id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.active() });
      qc.invalidateQueries({ queryKey: notificationKeys.read() });
    },
  });
}
