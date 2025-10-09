"use client";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense, useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { verifyPhoneCode, addPhoneAndSendOtp } from "@/lib/api/auth";

function VerifyPhoneInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const phone = sp.get("phone") || "";
  const [value, setValue] = useState("");
  const [resending, setResending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await verifyPhoneCode(phone, value);
    if (res.ok) {
      toast.success("Celular verificado");
      router.replace("/events");
    } else {
      toast.error("Código inválido");
    }
  }

  async function onResend() {
    try {
      setResending(true);
      const res = await addPhoneAndSendOtp(phone);
      if (res.ok) {
        setValue("");
        toast.success("Código reenviado");
      }
    } catch (e) {
      toast.error("Falha ao reenviar código");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-3xl sm:text-4xl font-extrabold">Digite seu código</CardTitle>
          <div className="text-sm text-foreground/70">Enviamos um código de 6 dígitos para:</div>
          <div className="text-2xl sm:text-3xl font-semibold text-foreground tracking-wide">{phone}</div>
          <CardDescription className="!mt-0">
            Não é o seu número? <Link href={`/add-phone?prefill=${encodeURIComponent(phone)}`} className="text-primary font-semibold hover:underline">Atualize seu número</Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={value} onChange={setValue}>
                <InputOTPGroup className="flex gap-5 sm:gap-6">
                  <InputOTPSlot index={0} className="h-16 w-14 sm:h-20 sm:w-16 text-2xl sm:text-3xl" />
                  <InputOTPSlot index={1} className="h-16 w-14 sm:h-20 sm:w-16 text-2xl sm:text-3xl" />
                  <InputOTPSlot index={2} className="h-16 w-14 sm:h-20 sm:w-16 text-2xl sm:text-3xl" />
                  <InputOTPSlot index={3} className="h-16 w-14 sm:h-20 sm:w-16 text-2xl sm:text-3xl" />
                  <InputOTPSlot index={4} className="h-16 w-14 sm:h-20 sm:w-16 text-2xl sm:text-3xl" />
                  <InputOTPSlot index={5} className="h-16 w-14 sm:h-20 sm:w-16 text-2xl sm:text-3xl" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={onResend}
                disabled={resending}
                className="text-primary font-semibold disabled:opacity-60"
              >
                Reenviar código
              </button>
            </div>
            <Button type="submit" className="w-full" variant="accent">
              <Check size={16} /> Confirmar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPhonePage() {
  return <Suspense fallback={<div className="p-6">Carregando</div>}><VerifyPhoneInner /></Suspense>;
}
