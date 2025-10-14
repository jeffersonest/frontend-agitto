"use client";
import { Card } from "@/components/ui/card";
import { GradientHeader } from "@/components/ui/gradient-header";
import { FollowersList, FollowingList } from "@/components/users/follow-list";
import { useUserFollowers, useUserFollowing } from "@/lib/queries/users";
import FloatingTextField from "@/components/ui/floating-text-field";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { getMe, updateProfile, uploadProfileImage } from "@/lib/api/auth";
import { toast } from "sonner";
import { Camera, User, Users, Save, Settings } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [view, setView] = useState<"profile" | "social">("profile");
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
      toast.success("Perfil atualizado com sucesso!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Falha ao atualizar perfil";
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
      toast.success("Foto de perfil atualizada!");
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
      
      {/* Header Section */}
      <div className="px-6 pt-6 flex justify-center">
        <div className="w-full max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl ring-1 ring-black/5 bg-white/70 backdrop-blur p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full ring-2 ring-white/80 overflow-hidden flex-shrink-0">
                  <Image
                    src={image || "/avatar-placeholder.png"}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={pending}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera size={20} className="text-white" />
                </button>
                <input 
                  ref={inputRef} 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={onPickImage} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Settings size={20} className="text-muted-foreground" />
                  <h1 className="text-xl font-semibold">Configurações</h1>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerencie suas informações pessoais e configurações de conta
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    <span className="font-semibold text-foreground">
                      {followers.data?.pages?.[0]?.total || 0}
                    </span> seguidores
                  </span>
                  <span>
                    <span className="font-semibold text-foreground">
                      {following.data?.pages?.[0]?.total || 0}
                    </span> seguindo
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 pt-6 flex items-start justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1 rounded-xl bg-white/80 p-1 ring-1 ring-black/5">
                <button 
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    view === "profile" ? "bg-primary text-white" : "text-foreground hover:bg-gray-100"
                  }`} 
                  onClick={() => setView("profile")}
                >
                  <User size={14} />
                  Perfil
                </button>
                <button 
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    view === "social" ? "bg-primary text-white" : "text-foreground hover:bg-gray-100"
                  }`} 
                  onClick={() => setView("social")}
                >
                  <Users size={14} />
                  Social
                </button>
              </div>
            </div>

            {/* Profile Settings Tab */}
            {view === "profile" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 space-y-6 border-transparent ring-1 ring-black/5 bg-white/70 backdrop-blur">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <User size={18} />
                      Informações do Perfil
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Atualize suas informações pessoais que serão exibidas no seu perfil público
                    </p>
                  </div>

                  <form onSubmit={onSave} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FloatingTextField 
                        label="Nome completo" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome completo"
                      />
                      <FloatingTextField 
                        label="Nome de usuário" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0,20))}
                        placeholder="seuusername"
                      />
                    </div>
                    
                    <FloatingTextField 
                      label="Biografia" 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Conte um pouco sobre você..."
                      className="min-h-[80px]"
                    />
                    
                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit" 
                        disabled={pending}
                        className="flex items-center gap-2"
                      >
                        <Save size={16} />
                        {pending ? "Salvando..." : "Salvar alterações"}
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* Social Settings Tab */}
            {view === "social" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 border-transparent ring-1 ring-black/5 bg-white/70 backdrop-blur">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Users size={18} />
                        Conexões Sociais
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Visualize e gerencie suas conexões sociais
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-3">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          Seguidores ({followers.data?.pages?.[0]?.total || 0})
                        </h3>
                        <div className="max-h-96 overflow-y-auto">
                          {(() => {
                            type SimpleUser = { id: string; name: string; username: string | null; profileImageUrl: string | null; bio?: string | null };
                            const items: SimpleUser[] = (followers.data?.pages ?? []).flatMap((p) => p.followers.map((f) => f.user));
                            return <FollowersList items={items} loading={followers.isLoading} />;
                          })()}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          Seguindo ({following.data?.pages?.[0]?.total || 0})
                        </h3>
                        <div className="max-h-96 overflow-y-auto">
                          {(() => {
                            type SimpleUser = { id: string; name: string; username: string | null; profileImageUrl: string | null; bio?: string | null };
                            const items: SimpleUser[] = (following.data?.pages ?? []).flatMap((p) => p.following.map((f) => f.user));
                            return <FollowingList items={items} loading={following.isLoading} />;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 border-transparent ring-1 ring-black/5 bg-white/70 backdrop-blur">
                <div className="space-y-4">
                  <h3 className="font-semibold">Dicas de Perfil</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <p>Use uma foto de perfil clara e que te represente bem</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <p>Escolha um username único e fácil de lembrar</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <p>Escreva uma biografia interessante sobre você</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 border-transparent ring-1 ring-black/5 bg-white/70 backdrop-blur">
                <div className="space-y-4">
                  <h3 className="font-semibold">Estatísticas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Seguidores</span>
                      <span className="font-semibold">{followers.data?.pages?.[0]?.total || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Seguindo</span>
                      <span className="font-semibold">{following.data?.pages?.[0]?.total || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Perfil desde</span>
                      <span className="font-semibold">2025</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

