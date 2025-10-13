"use client";
import { useState } from "react";
import UsernameChip from "@/components/ui/username-chip";
import { Button } from "@/components/ui/button";
import { useComments, useCreateComment, useDeleteComment } from "@/lib/queries/social";
import { shortName } from "@/lib/text";

export default function CommentsSection({ eventId }: { eventId: string }) {
  const { data, isLoading } = useComments(eventId, { take: 50 });
  const create = useCreateComment(eventId);
  const del = useDeleteComment(eventId);
  const [text, setText] = useState("");
  const comments = data?.comments || [];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    await create.mutateAsync(t);
    setText("");
  }

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Comentários</h3>
      <form onSubmit={onSubmit} className="flex items-start gap-2">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva um comentário..."
          className="flex-1 rounded-lg ring-1 ring-black/5 bg-white/70 backdrop-blur px-3 py-2 text-sm min-h-20" />
        <Button type="submit" disabled={create.isPending}>Enviar</Button>
      </form>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg ring-1 ring-black/5 bg-white/60 backdrop-blur p-3 h-16 animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-sm text-muted-foreground">Seja o primeiro a comentar.</div>
      ) : (
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="rounded-lg ring-1 ring-black/5 bg-white/60 backdrop-blur p-3">
              <div className="text-sm font-medium">
                {shortName(c.user.name)}
                {c.user.username && (
                  <>
                    <span className="text-muted-foreground font-normal"> · </span>
                    <UsernameChip username={c.user.username} variant="tint" size="xs" />
                  </>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString("pt-BR")}</div>
              <div className="mt-1 text-sm whitespace-pre-wrap">{c.content}</div>
              <div className="mt-2 flex gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => del.mutate(c.id)} disabled={del.isPending}>Excluir</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
