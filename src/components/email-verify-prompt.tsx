"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getMe, requestEmailCode } from "@/lib/api/auth";

export default function EmailVerifyPrompt() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;
    const flag = typeof window !== "undefined" ? sessionStorage.getItem("agitto:emailPromptShown") : null;
    getMe()
      .then((me: any) => {
        if (!mounted) return;
        const notVerified = me && me.email && me.emailVerified === false;
        setEmail(me?.email || "");
        if (notVerified && !flag) {
          setOpen(true);
          try { sessionStorage.setItem("agitto:emailPromptShown", "1"); } catch {}
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  async function resend() {
    if (!email) return;
    try {
      setSending(true);
      await requestEmailCode(email);
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verifique seu e-mail</DialogTitle>
          <DialogDescription>
            Enviamos um link para {email}. Confirme seu e-mail para liberar criação e interação nos eventos.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Agora não</Button>
          <Button onClick={resend} disabled={sending}>{sending ? "Enviando…" : "Reenviar e-mail"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

