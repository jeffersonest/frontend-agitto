"use client";
import { useParams, useRouter } from "next/navigation";
import { useEvent, useUploadEventCover } from "@/lib/queries/events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data, isLoading } = useEvent(id);
  const upload = useUploadEventCover(id);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  if (isLoading) return <div className="p-6">Carregando…</div>;
  const event = data?.event;
  if (!event) return <div className="p-6">Evento não encontrado</div>;

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await upload.mutateAsync(file);
  }

  return (
    <div className="min-h-screen p-6 flex items-start justify-center">
      <Card className="w-full max-w-3xl p-6 space-y-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.coverImageUrl} alt="capa" className="w-full rounded-lg" />
          ) : (
            <div className="border border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
              Nenhuma imagem de capa
            </div>
          )}
          <div className="flex gap-3">
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
            <Button onClick={() => inputRef.current?.click()} disabled={upload.isPending}>Enviar capa</Button>
            <Button variant="secondary" onClick={() => router.push("/events")}>Voltar</Button>
          </div>
          <div className="text-sm text-foreground/80 whitespace-pre-wrap">
            {event.description}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

