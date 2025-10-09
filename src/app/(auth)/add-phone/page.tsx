"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Controller } from "react-hook-form";
import FloatingPhoneInputBR from "@/components/phone-input-br-floating";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { addPhoneAndSendOtp } from "@/lib/api/auth";
import { Send } from "lucide-react";

const schema = z.object({ phone: z.string().regex(/^\+55\d{10,11}$/, "Informe um telefone válido com DDD") });

function AddPhoneInner() {
  const sp = useSearchParams();
  const prefill = sp.get("prefill") || "";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { phone: prefill },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      setLoading(true);
      await addPhoneAndSendOtp(values.phone);
      toast.success("Código enviado por SMS");
      router.replace(`/verify-phone?phone=${encodeURIComponent(values.phone)}`);
    } catch (e: any) {
      toast.error(e?.message || "Falha ao enviar código");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-4">
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
          <Button type="submit" className="w-full" disabled={loading}>
            <Send size={16} /> {loading ? "Enviando..." : "Enviar código"}
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
