"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Controller } from "react-hook-form";
import FloatingPhoneInputBR from "@/components/phone-input-br-floating";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { addPhoneAndSendOtp } from "@/lib/api/auth";
import { Send, ArrowLeft } from "lucide-react";
import { getAccessToken } from "@/lib/api/http";

const schema = z.object({ phone: z.string().regex(/^\+55\d{10,11}$/, "Informe um telefone válido com DDD") });

function AddPhoneInner() {
  const sp = useSearchParams();
  const prefill = sp.get("prefill") || "";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>("");
  const backTargetRef = useRef<string>("/login");
  
  useEffect(() => {
    try {
      backTargetRef.current = getAccessToken() ? "/events" : "/login";
    } catch {
      backTargetRef.current = "/login";
    }
  }, []);
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { phone: prefill },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setErrorDetails("");
    try {
      setLoading(true);
      console.log("📱 Enviando OTP para:", values.phone);
      
      const result = await addPhoneAndSendOtp(values.phone);
      console.log("✅ OTP enviado com sucesso:", result);
      
      toast.success("Código enviado por SMS");
      
      // Aguarda um pouco antes de redirecionar
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log("🔄 Redirecionando para /verify-phone");
      router.replace(`/verify-phone?phone=${encodeURIComponent(values.phone)}`);
    } catch (e: unknown) {
      console.error("❌ Erro ao enviar OTP:", e);
      const msg = typeof e === "object" && e && "message" in e ? String((e as { message?: string }).message) : "Falha ao enviar código";
      
      setErrorDetails(msg);
      
      if (msg.toLowerCase().includes("already registered")) {
        toast.error("Este número já está cadastrado por outro usuário. Tente outro número.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-3">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Verificar celular</h1>
          <p className="text-sm text-foreground/70">Informe seu número no formato E.164 para receber um código.</p>
        </div>
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <Controller
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FloatingPhoneInputBR label="Celular" value={field.value} onChange={field.onChange} />
            )}
          />
          {form.formState.errors.phone && (
            <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
          )}
          {errorDetails && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{errorDetails}</p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            <Send size={16} /> {loading ? "Enviando..." : "Enviar código"}
          </Button>
          <Button type="button" variant="secondary" className="w-full" onClick={() => router.replace(backTargetRef.current)}>
            <ArrowLeft size={16} /> Voltar
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function AddPhonePage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando…</div>}>
      <AddPhoneInner />
    </Suspense>
  );
}
