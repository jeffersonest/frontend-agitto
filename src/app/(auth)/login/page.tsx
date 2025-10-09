"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import FloatingTextField from "@/components/ui/floating-text-field";
import { Mail, Phone, LockKeyhole, LogIn, UserPlus } from "lucide-react";
import PhoneInputBR from "@/components/phone-input-br";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { loginWithPassword, getMe } from "@/lib/api/auth";

const emailSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const phoneSchema = z.object({ phone: z.string().regex(/^\+55\d{10,11}$/), password: z.string().min(6) });

export default function LoginPage() {
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
      <Card className="w-full max-w-md space-y-6">
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
                <PhoneInputBR value={field.value} onChange={field.onChange} />
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
        <div className="pt-1">
          <Button asChild variant="accent" className="w-full">
            <a href="/register"><UserPlus size={16} /> Registrar</a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
