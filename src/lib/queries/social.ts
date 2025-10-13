"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createComment, deleteComment, listAttendees, listComments, listLikes, setRsvp, toggleLike, updateComment } from "@/lib/api/social";

export const socialKeys = {
  attendees: (eventId: string, status?: string) => ["social", "attendees", eventId, status || "ALL" ] as const,
  likes: (eventId: string) => ["social", "likes", eventId] as const,
  comments: (eventId: string) => ["social", "comments", eventId] as const,
};

export function useAttendees(eventId: string, status?: Parameters<typeof listAttendees>[1]) {
  return useQuery({ queryKey: socialKeys.attendees(eventId, status), queryFn: () => listAttendees(eventId, status) });
}

export function useLikes(eventId: string, params?: { skip?: number; take?: number }) {
  return useQuery({ queryKey: socialKeys.likes(eventId), queryFn: () => listLikes(eventId, params) });
}

export function useComments(eventId: string, params?: { skip?: number; take?: number }) {
  return useQuery({ queryKey: socialKeys.comments(eventId), queryFn: () => listComments(eventId, params) });
}

export function useRsvpMutation(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: Parameters<typeof setRsvp>[1]) => setRsvp(eventId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: socialKeys.attendees(eventId) });
    },
  });
}

export function useToggleLike(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => toggleLike(eventId),
    onSuccess: () => qc.invalidateQueries({ queryKey: socialKeys.likes(eventId) }),
  });
}

export function useCreateComment(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => createComment(eventId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: socialKeys.comments(eventId) }),
  });
}

export function useUpdateComment(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => updateComment(id, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: socialKeys.comments(eventId) }),
  });
}

export function useDeleteComment(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: socialKeys.comments(eventId) }),
  });
}

