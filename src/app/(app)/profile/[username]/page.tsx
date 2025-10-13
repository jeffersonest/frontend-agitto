"use client";
import { useParams } from "next/navigation";
import PageHero from "@/components/page-hero";
import { GradientHeader } from "@/components/ui/gradient-header";
import { usePublicProfile, useUserAttended, useUserFollowers, useUserFollowing, useUserInterested } from "@/lib/queries/users";
import type { EventEntity } from "@/lib/api/events";
import { Card } from "@/components/ui/card";
import EventCard from "@/components/events/event-card";
import UserList from "@/components/users/user-list";
import { useMemo, useRef } from "react";

export default function UserProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const profile = usePublicProfile(username);
  const userId = profile.data?.user?.id as string | undefined;
  const interested = useUserInterested(userId, 12);
  const attended = useUserAttended(userId, 12);
  const followers = useUserFollowers(userId, 20);
  const following = useUserFollowing(userId, 20);
  const interestedEvents = useMemo(() => (interested.data?.pages || []).flatMap((p) => p.events || []), [interested.data]);
  const attendedEvents = useMemo(() => (attended.data?.pages || []).flatMap((p) => p.events || []), [attended.data]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="min-h-screen">
      <GradientHeader height="sm" />
      <PageHero title={profile.data?.user?.name || `@${username}`} description={profile.isLoading ? "Carregando…" : `@${profile.data?.user?.username || username}`} />

      <div className="px-6 pt-6 flex items-start justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-6 border-transparent ring-1 ring-black/5 bg-white/70 backdrop-blur">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Eventos com interesse</h2>
              {interested.isLoading ? (
                <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
                  {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-56 rounded-2xl bg-secondary animate-pulse" />))}
                </div>
              ) : interestedEvents.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sem eventos marcados com interesse.</div>
              ) : (
                <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
                  {interestedEvents.map((ev: EventEntity) => (
                    <EventCard
                      key={ev.id}
                      id={ev.id}
                      title={ev.title}
                      startDate={ev.startDate}
                      locationName={ev.locationName}
                      locationAddress={ev.locationAddress}
                      coverImageUrl={ev.coverImageUrl}
                      tags={ev.tags}
                      attendeeCount={ev.attendeeCount}
                      ownerUsername={ev?.owner?.username || null}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Eventos que participou</h2>
              {attended.isLoading ? (
                <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
                  {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-56 rounded-2xl bg-secondary animate-pulse" />))}
                </div>
              ) : attendedEvents.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sem eventos passados.</div>
              ) : (
                <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
                  {attendedEvents.map((ev: EventEntity) => (
                    <EventCard
                      key={ev.id}
                      id={ev.id}
                      title={ev.title}
                      startDate={ev.startDate}
                      locationName={ev.locationName}
                      locationAddress={ev.locationAddress}
                      coverImageUrl={ev.coverImageUrl}
                      tags={ev.tags}
                      attendeeCount={ev.attendeeCount}
                      ownerUsername={ev?.owner?.username || null}
                    />
                  ))}
                </div>
              )}
              <div ref={sentinelRef} className="h-8" />
            </section>
          </Card>

          <div className="space-y-6">
            <Card className="p-4 border-transparent ring-1 ring-black/5 bg-white/70 backdrop-blur">
              <UserList title={`Seguidores (${followers.data?.pages?.[0]?.total || 0})`} items={(followers.data?.pages?.flatMap((p) => p.followers) || []).map((f) => ({ id: f.id, user: f.user }))} loading={followers.isLoading} />
            </Card>
            <Card className="p-4 border-transparent ring-1 ring-black/5 bg-white/70 backdrop-blur">
              <UserList title={`Seguindo (${following.data?.pages?.[0]?.total || 0})`} items={(following.data?.pages?.flatMap((p) => p.following) || []).map((f) => ({ id: f.id, user: f.user }))} loading={following.isLoading} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
