"use client";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

type Props = {
  leftTitle: string;
  leftSubtitle?: string;
  leftCta?: { href: string; label: string; icon?: React.ReactNode };
  children: React.ReactNode;
};

export default function AuthSplitCard({ leftTitle, leftSubtitle, leftCta, children }: Props) {
  return (
    <Card className="w-full max-w-4xl p-0 overflow-hidden">
      <div className="grid md:grid-cols-2">
        <div className={cn(
          "relative p-8 sm:p-10 text-white",
          "bg-[color:var(--lavender-600)]",
          "[background-image:radial-gradient(1200px_800px_at_10%_-10%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_60%),radial-gradient(900px_600px_at_90%_110%,color-mix(in_oklab,var(--lavender)_24%,transparent),transparent_60%)]"
        )}>
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{leftTitle}</h2>
            {leftSubtitle && (
              <p className="text-white/80 text-sm max-w-xs">{leftSubtitle}</p>
            )}
            {leftCta && (
              <Button asChild variant="outline" className="mt-1 border-white/80 text-white hover:bg-white/10">
                <Link href={leftCta.href}>{leftCta.icon}{leftCta.label}</Link>
              </Button>
            )}
          </div>
        </div>
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex justify-center">
            <Logo size="xl" animated />
          </div>
          {children}
        </div>
      </div>
    </Card>
  );
}
