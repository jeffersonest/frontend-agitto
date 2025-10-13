"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

type Props = {
  leftTitle: string;
  leftSubtitle?: string;
  leftCta?: { href: string; label: string; icon?: React.ReactNode };
  tone?: "teal" | "lavender";
  bgImage?: string;
  children: React.ReactNode;
};

export default function AuthSplitScreen({ leftTitle, leftSubtitle, leftCta, tone = "lavender", bgImage = "/image.webp", children }: Props) {
  const isTeal = tone === "teal";
  const ctaFillClass = isTeal
    ? "bg-[color:var(--lavender-600)]"
    : "bg-[color:var(--primary-600)]";
  const ctaHoverClass = isTeal
    ? "hover:bg-[color:var(--lavender-600)]"
    : "hover:bg-[color:var(--primary-600)]";
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className={cn("relative flex items-center justify-center p-10 text-white overflow-hidden")}>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${bgImage})` }} />
          <div className={cn("absolute inset-0", isTeal ? "bg-[color:var(--primary-700)]/45" : "bg-[color:var(--lavender-700)]/45")} />
          <div className="absolute inset-0 backdrop-blur-[2px]" />
        </div>
        <div className="relative text-center max-w-sm space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{leftTitle}</h1>
          {leftSubtitle && <p className="text-white/80">{leftSubtitle}</p>}
          {leftCta && (
            <Button
              asChild
              variant="default"
              className={cn("mt-1 border border-white/20 text-white hover:border-white", ctaFillClass, ctaHoverClass)}
            >
              <Link href={leftCta.href}>{leftCta.icon}{leftCta.label}</Link>
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center">
            <Logo width={140} height={48} className="h-12" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
