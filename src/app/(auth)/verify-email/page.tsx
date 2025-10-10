"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { getAccessToken } from "@/lib/api/http";
import { verifyEmailToken, requestEmailCode } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function VerifyEmailInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const email = sp.get("email") || "";
  const token = sp.get("token") || sp.get("t") || "";
  const isLoggedIn = typeof window !== "undefined" && !!getAccessToken();
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
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

  const Actions = (
    <>
      {status === "success" ? (
        isLoggedIn ? (
          <Link href="/events" className="text-primary font-semibold hover:underline">Ir para eventos</Link>
        ) : (
          <Link href="/login" className="text-primary font-semibold hover:underline">Ir para login</Link>
        )
      ) : isLoggedIn ? (
        email ? (
          <Button
            variant="secondary"
            onClick={async () => {
              await requestEmailCode(email);
            }}
          >
            Reenviar e-mail
          </Button>
        ) : null
      ) : (
        <Link href="/login" className="text-primary font-semibold hover:underline">Voltar ao login</Link>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-lg p-8">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-3xl font-extrabold">Verificação por e-mail</CardTitle>
          {status === "verifying" && (
            <CardDescription>Verificando seu e-mail…</CardDescription>
          )}
          {status === "success" && (
            <CardDescription>E-mail verificado com sucesso.</CardDescription>
          )}
          {status !== "verifying" && !token && (
            <CardDescription>Abra o link enviado para seu e-mail.</CardDescription>
          )}
          {email && <div className="text-base text-foreground/80 truncate">{email}</div>}
        </CardHeader>
        <CardContent className="text-center space-y-3">
          {status === "error" && (
            <div className="text-sm text-destructive">{error || "Link inválido ou expirado."}</div>
          )}
          <div className="flex items-center justify-center gap-3">{Actions}</div>
          <div className="flex items-center justify-center">
            <Button type="button" variant="secondary" onClick={() => router.replace(isLoggedIn ? "/events" : "/login")}>Fechar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<div className="p-6">Carregando</div>}><VerifyEmailInner /></Suspense>;
}
