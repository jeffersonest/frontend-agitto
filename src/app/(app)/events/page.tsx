"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getMe } from "@/lib/api/auth";

export default function EventsPage() {
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [phoneVerified, setPhoneVerified] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        // me.emailVerified is expected from backend
        setEmailVerified(Boolean((me as any).emailVerified));
        setPhoneVerified(Boolean((me as any).phoneVerified));
        setEmail((me as any).email ?? null);
        if ((me as any).phoneVerified === false) {
          router.replace("/add-phone");
          return;
        }
      } catch {
        // ignore
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen p-6 flex items-start justify-center">
      <Card className="w-full max-w-3xl p-8 space-y-6">
        <PageHeader title="Eventos" />
        {phoneVerified === false && (
          <div className="rounded-xl border bg-secondary p-4 text-sm">
            Seu celular ainda não está verificado. <a href="/add-phone" className="text-primary font-semibold hover:underline">Adicionar/verificar agora</a>.
          </div>
        )}
        {emailVerified === false && (
          <div className="rounded-xl border bg-secondary p-4 text-sm">
            Seu e-mail ainda não está verificado. <a href={email ? `/verify-email?email=${encodeURIComponent(email)}` : "/verify-email"} className="text-primary font-semibold hover:underline">Verificar agora</a>.
          </div>
        )}
        {/* Conteúdo da lista de eventos entrará aqui */}
      </Card>
    </div>
  );
}
