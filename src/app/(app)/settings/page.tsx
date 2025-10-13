"use client";
import { Card } from "@/components/ui/card";
import { GradientHeader } from "@/components/ui/gradient-header";
import { PageHeader } from "@/components/page-header";
import { FollowersList, FollowingList } from "@/components/users/follow-list";
import { useUserFollowers, useUserFollowing } from "@/lib/queries/users";
import FloatingTextField from "@/components/ui/floating-text-field";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { getMe, updateProfile, uploadProfileImage } from "@/lib/api/auth";
import { toast } from "sonner";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [myId, setMyId] = useState<string | null>(null);

  type Me = { id?: string; name?: string; username?: string; bio?: string | null; profileImageUrl?: string | null };
  useEffect(() => {
    getMe()
      .then((v) => {
        const m = v as Me;
        setMyId(m?.id || null);
        setName(m?.name || "");
        setUsername(m?.username || "");
        setBio(m?.bio || "");
        setImage(m?.profileImageUrl || null);
      })
      .catch(() => {});
  }, []);

  const followers = useUserFollowers(myId || undefined);
  const following = useUserFollowing(myId || undefined);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setPending(true);
      await updateProfile({ name, username: username.toLowerCase(), bio });
      toast.success("Perfil atualizado");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Falha ao atualizar";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPending(true);
      const res = await uploadProfileImage(file);
      setImage(res.imageUrl);
      toast.success("Imagem atualizada");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Falha ao enviar imagem";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen">
      <GradientHeader height="sm" />
      <div className="px-6 pt-6">
        <PageHeader title="Configurações" />
      </div>
      <div className="px-6 pt-6 flex items-start justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8 space-y-6 ring-1 ring-black/5 bg-white/70 backdrop-blur">
        <form onSubmit={onSave} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image || "/avatar-placeholder.png"} alt="avatar" className="size-16 rounded-full object-cover ring-1 ring-black/5" />
            </div>
            <div className="flex items-center gap-2">
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
              <Button type="button" size="sm" onClick={() => inputRef.current?.click()} disabled={pending}>Alterar foto</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FloatingTextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
            <FloatingTextField label="Username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0,20))} />
          </div>
          <FloatingTextField label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>Salvar alterações</Button>
          </div>
        </form>
        </Card>
        <div className="space-y-6">
          <Card className="p-4 ring-1 ring-black/5 bg-white/70 backdrop-blur">
            {(() => {
              type SimpleUser = { id: string; name: string; username: string | null; profileImageUrl: string | null; bio?: string | null };
              const items: SimpleUser[] = (followers.data?.pages ?? []).flatMap((p) => p.followers.map((f) => f.user));
              return <FollowersList items={items} loading={followers.isLoading} />;
            })()}
          </Card>
          <Card className="p-4 ring-1 ring-black/5 bg-white/70 backdrop-blur">
            {(() => {
              type SimpleUser = { id: string; name: string; username: string | null; profileImageUrl: string | null; bio?: string | null };
              const items: SimpleUser[] = (following.data?.pages ?? []).flatMap((p) => p.following.map((f) => f.user));
              return <FollowingList items={items} loading={following.isLoading} />;
            })()}
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}

