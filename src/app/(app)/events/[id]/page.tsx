"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEvent, useUploadEventCover } from "@/lib/queries/events";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Users, Share2, Pencil } from "lucide-react";
import { formatEventDate, formatLocationShort } from "@/lib/events/format";
import { getMe } from "@/lib/api/auth";
import { toast } from "sonner";
import { getTokenInfo } from "@/lib/auth/token";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data, isLoading } = useEvent(id);
  const upload = useUploadEventCover(id);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [comments, setComments] = useState<Array<{ id: string; author: string; text: string; ts: number }>>([]);
  const [text, setText] = useState("");
  const [myId, setMyId] = useState<string | null>(null);
  const [pendingCover, setPendingCover] = useState<string | null>(null);

  useEffect(() => {
    getMe().then((m: any) => setMyId(m?.id ?? null)).catch(() => setMyId(null));
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
    } catch (err: any) {
      const msg = String(err?.message || "Falha ao enviar");
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
      <div className="relative h-72 sm:h-96 w-full overflow-hidden">
        {pendingCover || ev.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pendingCover || (ev.coverImageUrl as string)} alt="capa" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--primary-tint-1)] to-[color:var(--lavender-100)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6">
          <div className="rounded-xl bg-white/95 backdrop-blur shadow-sm p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold line-clamp-2">{ev.title}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {dateText && <span className="inline-flex items-center gap-1"><Calendar size={16} />{dateText}</span>}
                  {ev.endDate && <span className="inline-flex items-center gap-1"><Clock size={16} />Término flexível</span>}
                  {localText && <span className="inline-flex items-center gap-1"><MapPin size={16} className="text-[color:var(--primary)]" />{localText}</span>}
                  {typeof ev.attendeeCount === "number" && <span className="inline-flex items-center gap-1"><Users size={16} />{ev.attendeeCount} participantes</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => navigator.share?.({ title: ev.title, url: location.href }).catch(() => {})}>
                  <Share2 /> Compartilhar
                </Button>
                {isOwner && (
                  <>
                    <Button asChild size="sm">
                      <Link href={`/events/${id}/edit`}><Pencil /> Editar</Link>
                    </Button>
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
                    <Button
                      size="sm"
                      onClick={() => {
                        const info = getTokenInfo();
                        if (!info.token) { toast.error("Faça login para enviar uma capa"); router.push("/login"); return; }
                        if (info.expired) { toast.error("Sua sessão expirou. Faça login novamente"); router.push("/login"); return; }
                        inputRef.current?.click();
                      }}
                      disabled={upload.isPending}
                    >
                      {upload.isPending ? "Enviando..." : "Enviar capa"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 flex items-start justify-center">
        <div className="grid w-full max-w-5xl grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2 space-y-6">
            <article className="prose prose-sm max-w-none text-foreground/90">
              <p className="whitespace-pre-wrap">{ev.description || "Sem descrição."}</p>
            </article>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">Localização</h3>
              {ev.locationLat && ev.locationLng ? (
                <div className="rounded-lg overflow-hidden border bg-secondary">
                  <iframe
                    title="mapa"
                    src={`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${ev.locationLat},${ev.locationLng}`}
                    className="w-full h-72"
                  />
                  <div className="p-3 text-xs text-muted-foreground">
                    <a className="text-primary font-medium" href={`https://www.openstreetmap.org/?mlat=${ev.locationLat}&mlon=${ev.locationLng}#map=16/${ev.locationLat}/${ev.locationLng}`} target="_blank" rel="noreferrer">Abrir no mapa</a>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Local não informado.</div>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">Galeria</h3>
              <div className="rounded-lg border p-6 text-sm text-muted-foreground bg-secondary/40">Em breve: fotos e vídeos do evento.</div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">Comentários</h3>
              <div className="space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const t = text.trim();
                    if (!t) return;
                    setComments((prev) => [{ id: String(Date.now()), author: "Você", text: t, ts: Date.now() }, ...prev]);
                    setText("");
                  }}
                  className="flex items-start gap-2"
                >
                  <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva um comentário..."
                    className="flex-1 rounded-lg border bg-secondary px-3 py-2 text-sm min-h-20" />
                  <Button type="submit">Enviar</Button>
                </form>
                {comments.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Seja o primeiro a comentar.</div>
                ) : (
                  <div className="space-y-2">
                    {comments.map((c) => (
                      <div key={c.id} className="rounded-lg border p-3">
                        <div className="text-sm font-medium">{c.author}</div>
                        <div className="text-xs text-muted-foreground">{new Date(c.ts).toLocaleString("pt-BR")}</div>
                        <div className="mt-1 text-sm whitespace-pre-wrap">{c.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </Card>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="text-sm font-semibold mb-2">Quando</div>
              <div className="text-sm text-foreground/80 flex items-center gap-2"><Calendar size={16} /> {dateText || "A definir"}</div>
              {ev.endDate && (
                <div className="text-xs text-muted-foreground mt-1">Término: {new Date(ev.endDate).toLocaleString("pt-BR")}</div>
              )}
            </Card>
            <Card className="p-4">
              <div className="text-sm font-semibold mb-2">Local</div>
              {localText ? (
                <div className="text-sm text-foreground/80 flex items-center gap-2"><MapPin size={16} className="text-[color:var(--primary)]" /> {localText}</div>
              ) : (
                <div className="text-sm text-muted-foreground">A definir</div>
              )}
            </Card>
            <Card className="p-4">
              <div className="text-sm font-semibold mb-2">Participantes</div>
              <div className="text-sm text-foreground/80">{typeof ev.attendeeCount === "number" ? `${ev.attendeeCount} pessoas vão` : "—"}</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
