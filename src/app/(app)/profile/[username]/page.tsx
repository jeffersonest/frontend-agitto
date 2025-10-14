"use client";
import { useParams } from "next/navigation";
import { GradientHeader } from "@/components/ui/gradient-header";
import { usePublicProfile, useUserAttended, useUserFollowers, useUserFollowing, useUserInterested } from "@/lib/queries/users";
import type { EventEntity } from "@/lib/api/events";
import { Card } from "@/components/ui/card";
import EventCard from "@/components/events/event-card";
import UserList from "@/components/users/user-list";
import { useMemo, useRef, useEffect, useState } from "react";
import { useEventInteractions } from "@/lib/stores/eventInteractionsStore";
import FollowButton from "@/components/social/follow-button";
import { getMe } from "@/lib/api/auth";
import { Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import UsernameChip from "@/components/ui/username-chip";
import { shortName } from "@/lib/text";

export default function UserProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  
  const [myId, setMyId] = useState<string | null>(null);
  const [view, setView] = useState<"events" | "gallery">("events");

  // Buscar meu ID primeiro
  useEffect(() => {
    async function fetchMe() {
      try {
        const user = await getMe() as { id: string };
        setMyId(user.id);
      } catch {
        setMyId(null);
      }
    }
    fetchMe();
  }, []);

  // Só fazer a query do perfil quando temos o myId ou sabemos que não tem usuário logado
  const profile = usePublicProfile(username);
  const userId = profile.data?.user?.id as string | undefined;
  const interested = useUserInterested(userId, 12);
  const attended = useUserAttended(userId, 12);
  const followers = useUserFollowers(userId, 20);
  const following = useUserFollowing(userId, 20);
  const interestedEvents = useMemo(() => (interested.data?.pages || []).flatMap((p) => p.events || []), [interested.data]);
  const attendedEvents = useMemo(() => (attended.data?.pages || []).flatMap((p) => p.events || []), [attended.data]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const setInteractions = useEventInteractions((state) => state.setInteractions);

  const isOwnProfile = myId && userId && myId === userId;
  const isFollowing = profile.data?.isFollowing ?? false;

  useEffect(() => {
    async function fetchMe() {
      try {
        const user = await getMe() as { id: string };
        setMyId(user.id);
      } catch {
        setMyId(null);
      }
    }
    fetchMe();
  }, []);

  useEffect(() => {
    const allEvents = [...interestedEvents, ...attendedEvents];
    if (allEvents.length > 0) {
      setInteractions(allEvents);
    }
  }, [interestedEvents, attendedEvents, setInteractions]);

  return (
    <div className="min-h-screen">
      <GradientHeader height="sm" />
      <div className="px-6 pt-6 flex justify-center">
        <div className="w-full max-w-6xl">
          <div className="rounded-xl ring-1 ring-black/5 bg-white/70 backdrop-blur p-6 shadow-sm">
            {profile.isLoading ? (
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-secondary animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 rounded bg-secondary animate-pulse" />
                  <div className="h-3 w-32 rounded bg-secondary animate-pulse" />
                  <div className="h-3 w-64 rounded bg-secondary animate-pulse" />
                </div>
              </div>
            ) : profile.data?.user ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-24 h-24 rounded-full ring-2 ring-white/80 overflow-hidden flex-shrink-0">
                    <Image
                      src={(profile.data.user.profileImageUrl as string) || "/avatar-placeholder.png"}
                      alt={profile.data.user.name || profile.data.user.username || "avatar"}
                      width={96}
                      height={96}
                      className="w-24 h-24 object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-semibold truncate">{shortName(profile.data.user.name || `@${username}`)}</h1>
                      {profile.data.user.username && (
                        <UsernameChip username={profile.data.user.username} variant="tint" size="xs" />
                      )}
                    </div>
                    {profile.data.user.bio && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{profile.data.user.bio}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Users size={14} />
                        <span className="font-semibold text-foreground">{profile.data.stats?.followers ?? (followers.data?.pages?.[0]?.total || 0)}</span> seguidores
                      </span>
                      <span>
                        <span className="font-semibold text-foreground">{profile.data.stats?.following ?? (following.data?.pages?.[0]?.total || 0)}</span> seguindo
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isOwnProfile ? (
                    <Link href="/settings" className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm">Editar perfil</Link>
                  ) : userId && myId && !isOwnProfile ? (
                    <FollowButton
                      userId={userId}
                      initialIsFollowing={isFollowing}
                      variant="default"
                      size="sm"
                      username={username}
                    />
                  ) : myId === null ? (
                    <div className="text-sm text-muted-foreground">Carregando...</div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="px-6 pt-6 flex items-start justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1 rounded-xl bg-white/80 p-1 ring-1 ring-black/5">
                <button className={`px-3 py-1.5 rounded-lg text-sm ${view === "events" ? "bg-primary text-white" : "text-foreground"}`} onClick={() => setView("events")}>Eventos</button>
                <button className={`px-3 py-1.5 rounded-lg text-sm ${view === "gallery" ? "bg-primary text-white" : "text-foreground"}`} onClick={() => setView("gallery")}>Galeria</button>
              </div>
            </div>
            {view === "events" ? (
            <Card className="p-6 space-y-6 border-transparent ring-1 ring-black/5 bg-white/70 backdrop-blur">
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
            ) : (
              <Card className="p-6 border-transparent ring-1 ring-black/5 bg-white/70 backdrop-blur">
                <div className="text-sm text-muted-foreground">Em breve: galeria de posts com fotos e vídeos.</div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-4 border-transparent ring-1 ring-black/5 bg-white/70 backdrop-blur">
              <UserList title={`Seguidores (${followers.data?.pages?.[0]?.total || 0})`} items={(followers.data?.pages?.flatMap((p) => p.followers.map((f) => ({ id: f.user.id, user: f.user }))) || [])} loading={followers.isLoading} />
            </Card>
            <Card className="p-4 border-transparent ring-1 ring-black/5 bg-white/70 backdrop-blur">
              <UserList title={`Seguindo (${following.data?.pages?.[0]?.total || 0})`} items={(following.data?.pages?.flatMap((p) => p.following.map((f) => ({ id: f.user.id, user: f.user }))) || [])} loading={following.isLoading} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
