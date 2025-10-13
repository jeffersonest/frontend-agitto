"use client";
import AppHeader from "@/components/app-header";
import EmailVerifyPrompt from "@/components/email-verify-prompt";
import PhoneVerifyPrompt from "@/components/phone-verify-prompt";
import { useTokenRefresh } from "@/lib/hooks/useTokenRefresh";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useTokenRefresh();

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl p-6">{children}</main>
      <EmailVerifyPrompt />
      <PhoneVerifyPrompt />
    </div>
  );
}
