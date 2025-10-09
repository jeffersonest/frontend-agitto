"use client";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export default function SettingsPage() {
  return (
    <div className="min-h-screen p-6 flex items-start justify-center">
      <Card className="w-full max-w-3xl p-8 space-y-6">
        <PageHeader title="Configurações" />
        <p className="text-foreground/70">Em breve você poderá atualizar suas preferências e dados da conta por aqui.</p>
      </Card>
    </div>
  );
}

