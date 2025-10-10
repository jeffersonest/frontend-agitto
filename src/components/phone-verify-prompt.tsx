"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getMe } from "@/lib/api/auth";

export default function PhoneVerifyPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const flag = typeof window !== "undefined" ? sessionStorage.getItem("agitto:phonePromptShown") : null;
    getMe()
      .then((me) => {
        const m = me as Partial<{ phoneVerified: boolean }>;
        if (!mounted) return;
        const notVerified = m && m.phoneVerified === false;
        if (notVerified && !flag) {
          setOpen(true);
          try { sessionStorage.setItem("agitto:phonePromptShown", "1"); } catch {}
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verifique seu celular</DialogTitle>
          <DialogDescription>
            Adicione e verifique seu número para receber alertas importantes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Agora não</Button>
          <Button asChild>
            <a href="/add-phone">Adicionar celular</a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
