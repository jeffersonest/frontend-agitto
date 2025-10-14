"use client";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  maxWidthClass?: string;
  plain?: boolean;
};

export default function PageHero({ title, description, actions, className, containerClassName, maxWidthClass = "max-w-6xl", plain = false }: PageHeroProps) {
  return (
    <div className={cn("relative w-full pt-6", className)}>
      <div className={cn("mx-auto", maxWidthClass)}>
        {plain ? (
          <div className={cn("flex items-center justify-between", containerClassName)}>
            <div>
              <h1 className="text-2xl font-semibold">{title}</h1>
              {description ? <p className="text-sm text-muted-foreground mt-1">{description}</p> : null}
            </div>
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
          </div>
        ) : (
          <div className={cn("rounded-2xl bg-white/85 backdrop-blur shadow-sm p-5 flex items-center justify-between", containerClassName)}>
            <div>
              <h1 className="text-2xl font-semibold">{title}</h1>
              {description ? <p className="text-sm text-muted-foreground mt-1">{description}</p> : null}
            </div>
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
          </div>
        )}
      </div>
    </div>
  );
}
