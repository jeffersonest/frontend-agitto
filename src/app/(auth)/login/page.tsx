"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import FloatingTextField from "@/components/ui/floating-text-field";
import { Mail, Phone, LockKeyhole, LogIn, UserPlus } from "lucide-react";
import FloatingPhoneInputBR from "@/components/phone-input-br-floating";
import AuthSplitScreen from "@/components/auth-split-screen";
import { toast } from "sonner";
import { loginWithPassword } from "@/lib/api/auth";
import { useQueryClient } from "@tanstack/react-query";

const emailSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const phoneSchema = z.object({ phone: z.string().regex(/^\+55\d{10,11}$/), password: z.string().min(6) });

function LoginForm() {
  const qc = useQueryClient();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailForm = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema), defaultValues: { email: "", password: "" } });
  const phoneForm = useForm<z.infer<typeof phoneSchema>>({ resolver: zodResolver(phoneSchema), defaultValues: { phone: "", password: "" } });

  useEffect(() => {
    const expired = searchParams.get("expired");
    if (expired === "true") {
      toast.error("Sua sessão expirou. Faça login novamente.");
    }
  }, [searchParams]);

  async function onSubmitEmail(values: z.infer<typeof emailSchema>) {
    try {
      const res = await loginWithPassword({ email: values.email, password: values.password });
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ["notifications", "active"] });
        toast.success("Login realizado");
        router.replace("/events");
      }
    } catch {
      toast.error("Credenciais inválidas");
    }
  }

  async function onSubmitPhone(values: z.infer<typeof phoneSchema>) {
    try {
      const res = await loginWithPassword({ phone: values.phone, password: values.password });
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ["notifications", "active"] });
        toast.success("Login realizado");
        router.replace("/events");
      }
    } catch {
      toast.error("Credenciais inválidas");
    }
  }

  return (
    <div className="">
      <AuthSplitScreen
        leftTitle="Bem-vindo de volta"
        leftSubtitle="Acesse sua conta para continuar."
        tone="teal"
        leftCta={{ href: "/register", label: "Registrar", icon: <UserPlus size={16} /> }}
      >
        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Button variant={mode === "email" ? "default" : "secondary"} className="w-1/2" onClick={() => setMode("email")}>
              <Mail size={16} /> E-mail
            </Button>
            <Button variant={mode === "phone" ? "default" : "secondary"} className="w-1/2" onClick={() => setMode("phone")}>
              <Phone size={16} /> Celular
            </Button>
          </div>
          {mode === "email" ? (
          <form className="space-y-4" onSubmit={emailForm.handleSubmit(onSubmitEmail)}>
            <FloatingTextField type="email" label="E-mail" leftIcon={<Mail size={18} />} {...emailForm.register("email")} />
            {emailForm.formState.errors.email && (
              <p className="text-sm text-red-500">{emailForm.formState.errors.email.message}</p>
            )}
            <FloatingTextField togglePassword label="Senha" leftIcon={<LockKeyhole size={18} />} {...emailForm.register("password")} />
            {emailForm.formState.errors.password && (
              <p className="text-sm text-red-500">Informe uma senha válida</p>
            )}
            <Button type="submit" className="w-full"><LogIn size={16} /> Entrar</Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={phoneForm.handleSubmit(onSubmitPhone)}>
              <Controller
                control={phoneForm.control}
                name="phone"
                render={({ field }) => (
                  <FloatingPhoneInputBR label="Celular" value={field.value} onChange={field.onChange} />
                )}
              />
              {phoneForm.formState.errors.phone && (
                <p className="text-sm text-red-500">Informe um telefone válido</p>
              )}
              <FloatingTextField togglePassword label="Senha" leftIcon={<LockKeyhole size={18} />} {...phoneForm.register("password")} />
              {phoneForm.formState.errors.password && (
                <p className="text-sm text-red-500">Informe uma senha válida</p>
              )}
              <Button type="submit" className="w-full"><LogIn size={16} /> Entrar</Button>
            </form>
          )}
        </div>
      </AuthSplitScreen>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
