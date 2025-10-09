"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
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
        setEmailVerified(Boolean((me as any).emailVerified));
        setPhoneVerified(Boolean((me as any).phoneVerified));
        setEmail((me as any).email ?? null);
        if ((me as any).phoneVerified === false) {
          router.replace("/add-phone");
          return;
        }
      } catch {
        
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
          <div className="rounded-xl border p-4 text-sm bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-700 mt-0.5" />
              <div>
                Seu e-mail não está verificado. Para criar ou interagir, confirme seu endereço.
                {" "}
                <a
                  href={email ? `/verify-email?email=${encodeURIComponent(email)}` : "/verify-email"}
                  className="font-semibold text-amber-800 underline-offset-4 hover:underline"
                >
                  Verificar agora
                </a>
                .
              </div>
            </div>
          </div>
        )}
        
      </Card>
    </div>
  );
}
