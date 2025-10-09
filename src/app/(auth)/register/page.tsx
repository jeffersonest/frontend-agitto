"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import FloatingTextField from "@/components/ui/floating-text-field";
import { Mail, LockKeyhole, UserPlus, ArrowLeft } from "lucide-react";
import { Controller } from "react-hook-form";
import FloatingPhoneInputBR from "@/components/phone-input-br-floating";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { register as apiRegister } from "@/lib/api/auth";

const schema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(8),
    confirm: z.string().min(8),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Senhas não conferem",
  });

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirm: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      setLoading(true);
      const { name, email, phone, password } = values;
      const res = await apiRegister({ name, email, password });
      if (res.ok) {
        toast.success("Cadastro realizado. Vamos verificar seu celular.");
        const qp = phone ? `?prefill=${encodeURIComponent(phone)}` : "";
        router.replace(`/add-phone${qp}`);
      }
    } catch (e: any) {
      toast.error(e?.message || "Falha no cadastro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-6 space-y-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Criar conta</h1>
          <p className="text-sm text-foreground/70">Preencha seus dados para começar.</p>
        </div>
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <FloatingTextField
            label="Nome completo"
            leftIcon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
          <FloatingTextField type="email" label="E-mail" leftIcon={<Mail size={18} />} {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
          <Controller
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FloatingPhoneInputBR label="Celular" value={field.value} onChange={field.onChange} />
            )}
          />
          {form.formState.errors.phone && (
            <p className="text-sm text-red-500">Informe um telefone válido</p>
          )}
          <FloatingTextField togglePassword label="Senha (mín. 8)" leftIcon={<LockKeyhole size={18} />} {...form.register("password")} />
          <FloatingTextField togglePassword label="Confirmar senha" leftIcon={<LockKeyhole size={18} />} {...form.register("confirm")} />
          {form.formState.errors.confirm && (
            <p className="text-sm text-red-500">{form.formState.errors.confirm.message}</p>
          )}
          <Button type="submit" className="w-full" variant="accent" disabled={loading}>
            <UserPlus size={16} /> {loading ? "Enviando..." : "Cadastrar"}
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <a href="/login"><ArrowLeft size={16} /> Voltar ao login</a>
          </Button>
        </form>
      </Card>
    </div>
  );
}
