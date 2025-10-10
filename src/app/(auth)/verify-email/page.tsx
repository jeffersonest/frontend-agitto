"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { getAccessToken } from "@/lib/api/http";
import { verifyEmailToken, requestEmailCode } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MailCheck } from "lucide-react";

function VerifyEmailInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const email = sp.get("email") || "";
  const token = sp.get("token") || sp.get("t") || "";
  const isLoggedIn = typeof window !== "undefined" && !!getAccessToken();
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error" | "resending" | "resent">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setStatus("verifying");
    verifyEmailToken(token)
      .then((res) => {
        if (res.ok) {
          setStatus("success");
          if (isLoggedIn) router.replace("/events");
        } else {
          setStatus("error");
        }
      })
      .catch((e: unknown) => {
        const msg = typeof e === "object" && e && "message" in e ? String((e as { message?: string }).message) : "Falha ao verificar e-mail";
        setError(msg);
        setStatus("error");
      });
  }, [token, isLoggedIn, router]);

  async function handleResend() {
    if (!email) return;
    setStatus("resending");
    setError("");
    try {
      await requestEmailCode(email);
      setStatus("resent");
    } catch (e: unknown) {
      const msg = typeof e === "object" && e && "message" in e ? String((e as { message?: string }).message) : "Falha ao reenviar e-mail";
      if (msg.includes("already verified")) {
        setError("E-mail já verificado. Você pode fazer login.");
        setStatus("success");
      } else {
        setError(msg);
        setStatus("error");
      }
    }
  }

  const Actions = (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      {status === "success" ? (
        isLoggedIn ? (
          <Link href="/events" className="text-primary font-semibold hover:underline">Ir para eventos</Link>
        ) : (
          <Link href="/login" className="text-primary font-semibold hover:underline">Ir para login</Link>
        )
      ) : status === "resent" ? (
        <div className="text-sm text-green-600">E-mail reenviado com sucesso!</div>
      ) : isLoggedIn && email ? (
        <Button
          variant="accent"
          onClick={handleResend}
          disabled={status === "resending"}
        >
          {status === "resending" ? "Reenviando..." : "Reenviar e-mail"}
        </Button>
      ) : (
        <Link href="/login" className="text-primary font-semibold hover:underline">Voltar ao login</Link>
      )}
      <Button type="button" variant="secondary" onClick={() => router.replace(isLoggedIn ? "/events" : "/login")}>Fechar</Button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto size-12 rounded-full bg-[color:var(--lavender-50)] text-[color:var(--lavender-700)] grid place-items-center">
            <MailCheck size={22} />
          </div>
          <CardTitle className="text-2xl font-semibold">Verifique seu e-mail</CardTitle>
          {status === "verifying" && (
            <CardDescription>Verificando seu e-mail…</CardDescription>
          )}
          {status === "success" && (
            <CardDescription>E-mail verificado com sucesso.</CardDescription>
          )}
          {status !== "verifying" && !token && (
            <CardDescription className="text-foreground/70">Abra o link enviado para seu e-mail.</CardDescription>
          )}
          {email && (
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-[color:var(--primary-tint-2)] text-foreground/80 text-sm max-w-full mx-auto">
              <span className="truncate">{email}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "error" && (
            <div className="text-sm text-destructive">{error || "Link inválido ou expirado."}</div>
          )}
          {Actions}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<div className="p-6">Carregando</div>}><VerifyEmailInner /></Suspense>;
}
