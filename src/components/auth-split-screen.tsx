"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  leftTitle: string;
  leftSubtitle?: string;
  leftCta?: { href: string; label: string; icon?: React.ReactNode };
  tone?: "teal" | "lavender";
  children: React.ReactNode;
};

export default function AuthSplitScreen({ leftTitle, leftSubtitle, leftCta, tone = "lavender", children }: Props) {
  const isTeal = tone === "teal";
  const ctaFillClass = isTeal
    ? "bg-[color:var(--lavender-600)]"
    : "bg-[color:var(--primary-600)]";
  const ctaHoverClass = isTeal
    ? "hover:bg-[color:var(--lavender-600)]"
    : "hover:bg-[color:var(--primary-600)]";
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div
        className={cn(
          "relative flex items-center justify-center p-10 text-white",
          isTeal ? "bg-[color:var(--primary-600)]" : "bg-[color:var(--lavender-600)]",
          isTeal
            ? "[background-image:radial-gradient(1200px_800px_at_10%_-10%,color-mix(in_oklab,var(--lavender)_18%,transparent),transparent_60%),radial-gradient(900px_600px_at_90%_110%,color-mix(in_oklab,var(--primary)_24%,transparent),transparent_60%)]"
            : "[background-image:radial-gradient(1200px_800px_at_10%_-10%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_60%),radial-gradient(900px_600px_at_90%_110%,color-mix(in_oklab,var(--lavender)_24%,transparent),transparent_60%)]"
        )}
      >
        <div className="text-center max-w-sm space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{leftTitle}</h1>
          {leftSubtitle && <p className="text-white/80">{leftSubtitle}</p>}
          {leftCta && (
            <Button
              asChild
              variant="default"
              className={cn(
                "mt-1 border border-transparent text-white hover:border-white",
                ctaFillClass,
                ctaHoverClass
              )}
            >
              <Link href={leftCta.href}>{leftCta.icon}{leftCta.label}</Link>
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
