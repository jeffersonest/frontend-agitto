"use client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getPublicProfile, listUserEventsAttended, listUserEventsInterested, listUserFollowers, listUserFollowing } from "@/lib/api/users";

export const userKeys = {
  profile: (username: string) => ["user", "profile", username] as const,
  interested: (userId: string) => ["user", "events", "interested", userId] as const,
  attended: (userId: string) => ["user", "events", "attended", userId] as const,
  followers: (userId: string) => ["user", "followers", userId] as const,
  following: (userId: string) => ["user", "following", userId] as const,
};

export function usePublicProfile(username: string) {
  return useQuery({ queryKey: userKeys.profile(username), queryFn: () => getPublicProfile(username), enabled: Boolean(username) });
}

export function useUserInterested(userId?: string, take: number = 12) {
  return useInfiniteQuery({
    queryKey: userKeys.interested(userId || ""),
    queryFn: ({ pageParam }) => listUserEventsInterested(userId as string, { skip: pageParam?.skip ?? 0, take }),
    initialPageParam: { skip: 0, take },
    getNextPageParam: (last, pages) => ((last?.events?.length || 0) < take ? undefined : { skip: (pages.length) * take, take }),
    enabled: Boolean(userId),
  });
}

export function useUserAttended(userId?: string, take: number = 12) {
  return useInfiniteQuery({
    queryKey: userKeys.attended(userId || ""),
    queryFn: ({ pageParam }) => listUserEventsAttended(userId as string, { skip: pageParam?.skip ?? 0, take }),
    initialPageParam: { skip: 0, take },
    getNextPageParam: (last, pages) => ((last?.events?.length || 0) < take ? undefined : { skip: (pages.length) * take, take }),
    enabled: Boolean(userId),
  });
}

export function useUserFollowers(userId?: string, take: number = 20) {
  return useInfiniteQuery({
    queryKey: userKeys.followers(userId || ""),
    queryFn: ({ pageParam }) => listUserFollowers(userId as string, { skip: pageParam?.skip ?? 0, take }),
    initialPageParam: { skip: 0, take },
    getNextPageParam: (last, pages) => ((last.followers.length < take) ? undefined : { skip: (pages.length) * take, take }),
    enabled: Boolean(userId),
  });
}

export function useUserFollowing(userId?: string, take: number = 20) {
  return useInfiniteQuery({
    queryKey: userKeys.following(userId || ""),
    queryFn: ({ pageParam }) => listUserFollowing(userId as string, { skip: pageParam?.skip ?? 0, take }),
    initialPageParam: { skip: 0, take },
    getNextPageParam: (last, pages) => ((last.following.length < take) ? undefined : { skip: (pages.length) * take, take }),
    enabled: Boolean(userId),
  });
}

