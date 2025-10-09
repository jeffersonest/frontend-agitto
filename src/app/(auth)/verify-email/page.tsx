"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAccessToken } from "@/lib/api/http";

function VerifyEmailInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const email = sp.get("email") || "";
  const [value] = useState("");
  const isLoggedIn = typeof window !== "undefined" && !!getAccessToken();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-lg p-8">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-3xl font-extrabold">Verificação por e-mail</CardTitle>
          <CardDescription>
            A verificação por e-mail ainda não está disponível. Use a verificação por celular para continuar.
          </CardDescription>
          <div className="text-base text-foreground/80 truncate">{email}</div>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          {isLoggedIn ? (
            <Link href="/add-phone" className="text-primary font-semibold hover:underline">Adicionar celular</Link>
          ) : (
            <Link href="/login" className="text-primary font-semibold hover:underline">Voltar ao login</Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<div className="p-6">Carregando</div>}><VerifyEmailInner /></Suspense>;
}
