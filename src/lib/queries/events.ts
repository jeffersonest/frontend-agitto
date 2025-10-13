"use client";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEvent, deleteEvent, getEvent, listEvents, listLiveMap, listPopularWeek, listTrending, listFollowingFeed, listDiscovery, type CreateEventDto, type UpdateEventDto, updateEvent, uploadEventCover, getMyCalendar, type MyCalendarResponse } from "@/lib/api/events";

export const eventKeys = {
  all: ["events"] as const,
  list: (params?: unknown) => [...eventKeys.all, "list", params ?? {}] as const,
  detail: (id: string) => [...eventKeys.all, "detail", id] as const,
};

export function useEvents(params?: Parameters<typeof listEvents>[0]) {
  return useQuery({ queryKey: eventKeys.list(params), queryFn: () => listEvents(params) });
}

export function useEvent(id?: string) {
  return useQuery({ queryKey: id ? eventKeys.detail(id) : eventKeys.list(), queryFn: () => getEvent(id as string), enabled: Boolean(id) });
}

export function useInfiniteEvents(params?: Parameters<typeof listEvents>[0], options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: eventKeys.list(params),
    queryFn: ({ pageParam }) => listEvents({ ...(params || {}), skip: pageParam?.skip ?? 0, take: pageParam?.take ?? (params?.take ?? 20) }),
    initialPageParam: { skip: params?.skip ?? 0, take: params?.take ?? 20 },
    getNextPageParam: (lastPage) => {
      const { total, skip, take } = lastPage.pagination;
      const nextSkip = skip + take;
      if (nextSkip >= total) return undefined;
      return { skip: nextSkip, take };
    },
    enabled: options?.enabled ?? true,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateEventDto) => createEvent(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useUpdateEvent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateEventDto) => updateEvent(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventKeys.detail(id) });
      qc.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useUploadEventCover(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadEventCover(id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: eventKeys.detail(id) }),
  });
}

export function useLiveMap(params?: { locationCity?: string }) {
  const q = params?.locationCity ? { locationCity: params.locationCity } : {};
  return useQuery({
    queryKey: ["events", "live-map", q],
    queryFn: () => listLiveMap(q),
  });
}

export function usePopularWeek(params?: { skip?: number; take?: number }) {
  return useQuery({
    queryKey: ["events", "popular-week", params ?? {}],
    queryFn: () => listPopularWeek(params || {}),
    staleTime: 60_000 * 3,
  });
}

export function useTrendingInfinite(params?: { take?: number }) {
  const take = params?.take ?? 20;
  return useInfiniteQuery({
    queryKey: ["events", "trending", { take }],
    queryFn: ({ pageParam }) => listTrending({ skip: pageParam?.skip ?? 0, take }),
    initialPageParam: { skip: 0, take },
    getNextPageParam: (last) => {
      if (!last.pagination.hasMore) return undefined;
      return { skip: (last.pagination.skip ?? 0) + (last.pagination.take ?? take), take };
    },
    staleTime: 60_000 * 3,
  });
}

export function useFollowingFeedInfinite(params?: { take?: number; enabled?: boolean }) {
  const take = params?.take ?? 20;
  return useInfiniteQuery({
    queryKey: ["events", "feed", "following", { take }],
    queryFn: ({ pageParam }) => listFollowingFeed({ skip: pageParam?.skip ?? 0, take }),
    initialPageParam: { skip: 0, take },
    getNextPageParam: (last, pages) => (last.events.length < take ? undefined : { skip: pages.length * take, take }),
    enabled: params?.enabled ?? false,
    staleTime: 60_000 * 3,
  });
}

export function useDiscoveryInfinite(params?: { take?: number; enabled?: boolean }) {
  const take = params?.take ?? 20;
  return useInfiniteQuery({
    queryKey: ["events", "discovery", { take }],
    queryFn: ({ pageParam }) => listDiscovery({ skip: pageParam?.skip ?? 0, take }),
    initialPageParam: { skip: 0, take },
    getNextPageParam: (last, pages) => (last.events.length < take ? undefined : { skip: pages.length * take, take }),
    enabled: params?.enabled ?? false,
    staleTime: 60_000 * 5,
  });
}

export function useMyCalendar(month: string, rsvpStatus?: string) {
  return useQuery<MyCalendarResponse>({
    queryKey: ["calendar", month, rsvpStatus || "both"],
    queryFn: () => getMyCalendar({ month, rsvpStatus }),
    staleTime: 5 * 60_000,
  });
}
