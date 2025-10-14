"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import UsernameChip from "@/components/ui/username-chip";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useEvent, useUploadEventCover } from "@/lib/queries/events";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GradientHeader } from "@/components/ui/gradient-header";
import { MapPin, Calendar, Users, Share2, Pencil, ArrowLeft, Heart, CalendarCheck2, Bookmark, BookmarkCheck, ImageUp } from "lucide-react";
import { formatEventDate, formatLocationShort } from "@/lib/events/format";
import { getMe } from "@/lib/api/auth";
import { toast } from "sonner";
import { getTokenInfo } from "@/lib/auth/token";
import MapPoint from "@/components/events/map-point";
import MarkdownView from "@/components/ui/markdown-view";
import { shortName } from "@/lib/text";
import { useAttendees, useLikes } from "@/lib/queries/social";
import { setRsvp, deleteRsvp, toggleLike } from "@/lib/api/social";
import AttendeeList from "@/components/users/attendee-list";
import LikesList from "@/components/users/likes-list";
import CommentsSection from "@/components/events/comments";
import { useEventInteractions } from "@/lib/stores/eventInteractionsStore";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data, isLoading } = useEvent(id);
  const upload = useUploadEventCover(id);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [comments, setComments] = useState<Array<{ id: string; author: string; text: string; ts: number }>>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [pendingCover, setPendingCover] = useState<string | null>(null);
  const attendeesGoing = useAttendees(id, "GOING");
  const likes = useLikes(id);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [attendeeCount, setAttendeeCount] = useState<number>(0);
  const setInteractions = useEventInteractions((state) => state.setInteractions);
  const updateInteraction = useEventInteractions((state) => state.updateInteraction);
  const interaction = useEventInteractions((state) => state.interactions[id]);

  const viewerLiked = interaction?.isLiked ?? false;
  const viewerRsvp = interaction?.isGoing ? "GOING" : (interaction?.isInterested ? "INTERESTED" : null);

  const isEnded = (data?.event as { isEnded?: boolean })?.isEnded ?? false;

  useEffect(() => {
    if (!data?.event) return;
    const e = data.event as {
      userInteraction?: { isLiked?: boolean; isGoing?: boolean; isInterested?: boolean; isOwner?: boolean };
      likesCount?: number;
      attendeeCount?: number;
    };
    setLikesCount(typeof e.likesCount === "number" ? e.likesCount : 0);
    setAttendeeCount(typeof e.attendeeCount === "number" ? e.attendeeCount : 0);
    if (e.userInteraction) {
      setInteractions([{
        id,
        userInteraction: {
          isLiked: e.userInteraction.isLiked ?? false,
          isGoing: e.userInteraction.isGoing ?? false,
          isInterested: e.userInteraction.isInterested ?? false,
          isOwner: e.userInteraction.isOwner ?? false,
        }
      }]);
    }
  }, [data, id, setInteractions]);

  useEffect(() => {
    getMe().then((m: unknown) => { 
      const user = m as { id?: string };
      setMyId(user?.id ?? null); 
    }).catch(() => { setMyId(null); });
  }, []);
  useEffect(() => {
    const info = getTokenInfo();
    if (info.token && info.exp) {
      const mins = Math.round(info.remainingMs / 60000);
      const when = new Date(info.exp * 1000).toLocaleString("pt-BR");
      console.info(`[auth] token expira em ${when} (~${mins} min)`);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(`agitto:comments:${id}`);
    if (raw) setComments(JSON.parse(raw));
  }, [id]);
  useEffect(() => {
    localStorage.setItem(`agitto:comments:${id}`, JSON.stringify(comments));
  }, [id, comments]);

  if (isLoading) return <div className="p-6">Carregando…</div>;
  const ev = data?.event;
  if (!ev) return <div className="p-6">Evento não encontrado</div>;

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPendingCover(localUrl);
    try {
      await upload.mutateAsync(file);
      toast.success("Imagem enviada");
      setPendingCover(null);
    } catch (err: unknown) {
      const error = err as { message?: string };
      const msg = String(error?.message || "Falha ao enviar");
      toast.error(msg);
      if (/unauthorized|401/i.test(msg)) router.push("/login");
      setPendingCover(null);
    }
  }

  const dateText = formatEventDate(ev.startDate);
  const localText = formatLocationShort(ev.locationName || undefined, ev.locationAddress || undefined);

  const isOwner = myId ? ev.ownerId === myId : false;

  return (
    <div className="min-h-screen">
      <GradientHeader />
      <div className="relative h-72 sm:h-96 w-full overflow-hidden">
        {pendingCover || ev.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pendingCover || (ev.coverImageUrl as string)} alt="capa" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--primary-tint-1)] to-[color:var(--lavender-100)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute top-4 left-4">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 backdrop-blur shadow-sm"
            onClick={() => {
              if (window.history.length > 1) router.back(); else router.push("/events");
            }}
          >
            <ArrowLeft /> Voltar
          </Button>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="rounded-full bg-white/85 backdrop-blur px-2.5 py-1 text-xs ring-1 ring-black/5 inline-flex items-center gap-1">
            <Users size={14} /> {attendeeCount}
          </span>
          <span className="rounded-full bg-white/85 backdrop-blur px-2.5 py-1 text-xs ring-1 ring-black/5 inline-flex items-center gap-1">
            <Heart size={14} /> {likesCount}
          </span>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-6xl px-6">
          <div className="rounded-2xl bg-white/90 backdrop-blur shadow-sm p-4">
            <div className="flex flex-col gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {ev.owner?.username && ev.owner.username.toLowerCase() !== "insecure" && (
                    <UsernameChip username={ev.owner.username} variant="white" size="xs" />
                  )}
                </div>
                <h1 className="text-2xl font-semibold leading-tight line-clamp-2">{ev.title}</h1>
                <div className="mt-2 text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <div className="inline-flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{dateText || "Data a definir"}</span>
                  </div>
                  <span className="hidden sm:block select-none">•</span>
                  <div className="inline-flex items-center gap-2">
                    <MapPin size={16} className="text-[color:var(--primary)]" />
                    <span>{localText || "Local a definir"}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="rounded-xl bg-white/80 p-1 ring-1 ring-black/5 flex flex-wrap md:flex-nowrap gap-1">
                  <Button className="w-[112px] justify-center" variant="ghost" size="sm" title="Compartilhar" onClick={() => navigator.share?.({ title: ev.title, url: location.href }).catch(() => {})}>
                    <Share2 />
                    <span className="sm:hidden">Compart.</span>
                    <span className="hidden sm:inline">Compartilhar</span>
                  </Button>
                  <Button
                    className="w-[112px] justify-center"
                    size="sm"
                    variant={viewerRsvp === "GOING" ? "accent" : "ghost"}
                    disabled={isEnded}
                    title={isEnded ? "Evento encerrado" : "Confirmar presença"}
                    onClick={async () => {
                      const prev = { isGoing: interaction?.isGoing ?? false, isInterested: interaction?.isInterested ?? false };
                      try {
                        if (viewerRsvp === "GOING") {
                          updateInteraction(id, { isGoing: false, isInterested: false });
                          await deleteRsvp(id);
                          setAttendeeCount((c) => Math.max(0, c - 1));
                        } else {
                          updateInteraction(id, { isGoing: true, isInterested: false });
                          const res = await setRsvp(id, "GOING") as { attendeeCount?: number };
                          if (typeof res.attendeeCount === "number") setAttendeeCount(res.attendeeCount);
                        }
                      } catch (error: unknown) {
                        updateInteraction(id, prev);
                        const err = error as { message?: string };
                        const msg = err?.message || "";
                        if (msg.includes("past event") || msg.includes("encerrado")) {
                          toast.error("Este evento já foi encerrado");
                        } else {
                          toast.error("Falha ao atualizar");
                        }
                      }
                    }}
                  >
                    <CalendarCheck2 />
                    <span>Vou</span>
                  </Button>
                  <Button
                    className="w-[112px] justify-center"
                    size="sm"
                    variant={viewerRsvp === "INTERESTED" ? "accent" : "ghost"}
                    disabled={isEnded}
                    title={isEnded ? "Evento encerrado" : "Marcar interesse"}
                    onClick={async () => {
                      const prev = { isGoing: interaction?.isGoing ?? false, isInterested: interaction?.isInterested ?? false };
                      try {
                        if (viewerRsvp === "INTERESTED") {
                          updateInteraction(id, { isInterested: false, isGoing: false });
                          await deleteRsvp(id);
                        } else {
                          updateInteraction(id, { isInterested: true, isGoing: false });
                          const res = await setRsvp(id, "INTERESTED") as { attendeeCount?: number };
                          if (typeof res.attendeeCount === "number") setAttendeeCount(res.attendeeCount);
                        }
                      } catch (error: unknown) {
                        updateInteraction(id, prev);
                        const err = error as { message?: string };
                        const msg = err?.message || "";
                        if (msg.includes("past event") || msg.includes("encerrado")) {
                          toast.error("Este evento já foi encerrado");
                        } else {
                          toast.error("Falha ao atualizar");
                        }
                      }
                    }}
                  >
                    {viewerRsvp === "INTERESTED" ? <BookmarkCheck /> : <Bookmark />}
                    <span className="sm:hidden">Int.</span>
                    <span className="hidden sm:inline">Interesse</span>
                  </Button>
                  <Button
                    className="w-[112px] justify-center"
                    size="sm"
                    title="Curtir"
                    variant={viewerLiked ? "accent" : "ghost"}
                    onClick={async () => {
                      const prev = viewerLiked;
                      try {
                        updateInteraction(id, { isLiked: !prev });
                        const res = await toggleLike(id) as { liked: boolean; likesCount?: number };
                        if (typeof res.likesCount === "number") setLikesCount(res.likesCount);
                      } catch {
                        updateInteraction(id, { isLiked: prev });
                        toast.error("Falha ao curtir");
                      }
                    }}
                  >
                    <Heart />
                    <span>{viewerLiked ? "Curtido" : "Curtir"}</span>
                  </Button>
                  {isOwner && (
                    <>
                      <Button className="w-[112px] justify-center" asChild size="sm" variant="ghost" title="Editar">
                        <Link href={`/events/${id}/edit`}>
                          <Pencil />
                          <span>Editar</span>
                        </Link>
                      </Button>
                      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
                      <Button
                        className="w-[112px] justify-center"
                        size="sm"
                        variant="ghost"
                        title="Enviar capa"
                        onClick={() => {
                          const info = getTokenInfo();
                          if (!info.token) { toast.error("Faça login para enviar uma capa"); router.push("/login"); return; }
                          if (info.expired) { toast.error("Sua sessão expirou. Faça login novamente"); router.push("/login"); return; }
                          inputRef.current?.click();
                        }}
                        disabled={upload.isPending}
                      >
                        {upload.isPending ? (
                          <span>Enviando...</span>
                        ) : (
                          <>
                            <ImageUp />
                            <span className="sm:hidden">Capa</span>
                            <span className="hidden sm:inline">Enviar capa</span>
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 flex items-start justify-center">
        <div className="grid w-full max-w-8xl grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="p-6 lg:col-span-2 space-y-6 ring-1 ring-black/5 border-transparent shadow-none bg-white/60 backdrop-blur">
            <section className="prose prose-sm max-w-none text-foreground/90">
              {ev.description ? (
                <MarkdownView value={ev.description} />
              ) : (
                <p className="text-sm text-muted-foreground">Sem descrição.</p>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">Localização</h3>
              {ev.locationLat && ev.locationLng ? (
                <MapPoint lat={ev.locationLat} lng={ev.locationLng} title={ev.title} subtitle={localText || undefined} ownerUsername={ev.owner?.username || undefined} />
              ) : (
                <div className="text-sm text-muted-foreground">Local não informado.</div>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">Galeria</h3>
              <div className="rounded-xl ring-1 ring-black/5 p-6 text-sm text-muted-foreground bg-white/60 backdrop-blur">Em breve: fotos e vídeos do evento.</div>
            </section>

            <CommentsSection eventId={id} />
          </Card>

          <div className="space-y-4">
            {ev.owner?.username && ev.owner.username.toLowerCase() !== "insecure" && (
              <Card className="p-4 ring-1 ring-black/5 border-transparent shadow-none bg-white/60 backdrop-blur">
                <div className="text-sm font-semibold mb-2">Organizador</div>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 grid place-items-center overflow-hidden flex-shrink-0">
                    {ev.owner?.avatarUrl ? (
                      <Image src={ev.owner.avatarUrl as string} alt="avatar" width={40} height={40} className="rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold">{(ev.owner?.name || "").charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{shortName(ev.owner?.name || "Organizador")}</div>
                    <UsernameChip username={ev.owner.username} variant="tint" size="xs" />
                  </div>
                </div>
              </Card>
            )}
            <Card className="p-4 ring-1 ring-black/5 border-transparent shadow-none bg-white/60 backdrop-blur">
              <div className="text-sm font-semibold mb-2">Quando</div>
              <div className="text-sm text-foreground/80 flex items-center gap-2"><Calendar size={16} /> {dateText || "A definir"}</div>
              {ev.endDate && (
                <div className="text-xs text-muted-foreground mt-1">Término: {new Date(ev.endDate).toLocaleString("pt-BR")}</div>
              )}
            </Card>
            <Card className="p-4 ring-1 ring-black/5 border-transparent shadow-none bg-white/60 backdrop-blur">
              <div className="text-sm font-semibold mb-2">Local</div>
              {localText ? (
                <div className="text-sm text-foreground/80 flex items-center gap-2"><MapPin size={16} className="text-[color:var(--primary)]" /> {localText}</div>
              ) : (
                <div className="text-sm text-muted-foreground">A definir</div>
              )}
            </Card>
            <Card className="p-4 ring-1 ring-black/5 border-transparent shadow-none bg-white/60 backdrop-blur">
              <div className="text-sm font-semibold mb-2">Participantes</div>
              <div className="text-sm text-foreground/80 mb-2">{attendeeCount} pessoas vão</div>
              <AttendeeList items={attendeesGoing.data || []} loading={attendeesGoing.isLoading} />
            </Card>
            <Card className="p-4 ring-1 ring-black/5 border-transparent shadow-none bg-white/60 backdrop-blur">
              <div className="text-sm font-semibold mb-2">Curtidas</div>
              <div className="text-sm text-foreground/80 mb-2">{likesCount} curtidas</div>
              <LikesList items={(likes.data?.likes || []).map((l) => ({ id: l.id, user: l.user }))} loading={likes.isLoading} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
