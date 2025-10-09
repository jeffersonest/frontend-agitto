"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import FloatingTextField from "@/components/ui/floating-text-field";
import { Controller } from "react-hook-form";
import PhoneInputBR from "@/components/phone-input-br";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { loginWithPassword, getMe } from "@/lib/api/auth";

const emailSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const phoneSchema = z.object({ phone: z.string().regex(/^\+55\d{10,11}$/), password: z.string().min(6) });

export default function Home() {
  const [mode, setMode] = useState<"email" | "phone">("email");
  const router = useRouter();
  const emailForm = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema), defaultValues: { email: "", password: "" } });
  const phoneForm = useForm<z.infer<typeof phoneSchema>>({ resolver: zodResolver(phoneSchema), defaultValues: { phone: "", password: "" } });

  async function onSubmitEmail(values: z.infer<typeof emailSchema>) {
    try {
      const res = await loginWithPassword({ email: values.email, password: values.password });
      if (res.ok) {
        const me = await getMe();
        const phoneVerified = Boolean((me as any).phoneVerified);
        toast.success("Login realizado");
        router.replace(phoneVerified ? "/events" : "/add-phone");
      }
    } catch {
      toast.error("Credenciais inválidas");
    }
  }

  async function onSubmitPhone(values: z.infer<typeof phoneSchema>) {
    try {
      const res = await loginWithPassword({ phone: values.phone, password: values.password });
      if (res.ok) {
        const me = await getMe();
        const phoneVerified = Boolean((me as any).phoneVerified);
        toast.success("Login realizado");
        router.replace(phoneVerified ? "/events" : "/add-phone");
      }
    } catch {
      toast.error("Credenciais inválidas");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-sm p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Entrar</h1>
          <p className="text-sm text-foreground/70">Use e-mail ou celular e sua senha.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={mode === "email" ? "default" : "secondary"} className="w-1/2" onClick={() => setMode("email")}>E-mail</Button>
          <Button variant={mode === "phone" ? "default" : "secondary"} className="w-1/2" onClick={() => setMode("phone")}>Celular</Button>
        </div>
        {mode === "email" ? (
          <form className="space-y-3" onSubmit={emailForm.handleSubmit(onSubmitEmail)}>
            <FloatingTextField
              type="email"
              label="E-mail"
              leftIcon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"></path><path d="m22 6-10 7L2 6"/></svg>}
              {...emailForm.register("email")}
            />
            {emailForm.formState.errors.email && (
              <p className="text-sm text-red-500">{emailForm.formState.errors.email.message}</p>
            )}
            <FloatingTextField togglePassword label="Senha" {...emailForm.register("password")} />
            {emailForm.formState.errors.password && (
              <p className="text-sm text-red-500">Informe uma senha válida</p>
            )}
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        ) : (
          <form className="space-y-3" onSubmit={phoneForm.handleSubmit(onSubmitPhone)}>
            <Controller
              control={phoneForm.control}
              name="phone"
              render={({ field }) => (
                <PhoneInputBR value={field.value} onChange={field.onChange} />
              )}
            />
            {phoneForm.formState.errors.phone && (
              <p className="text-sm text-red-500">Informe um telefone válido</p>
            )}
            <FloatingTextField togglePassword label="Senha" {...phoneForm.register("password")} />
            {phoneForm.formState.errors.password && (
              <p className="text-sm text-red-500">Informe uma senha válida</p>
            )}
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        )}
        <p className="text-center text-sm text-foreground/70">
          Não tem conta? <a href="/register" className="text-primary font-semibold hover:underline">Criar conta</a>
        </p>
      </Card>
    </div>
  );
}
