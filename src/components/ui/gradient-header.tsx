interface GradientHeaderProps {
  className?: string;
  height?: "sm" | "md" | "lg";
}

export function GradientHeader({ className = "", height = "md" }: GradientHeaderProps) {
  const heightClasses = {
    sm: "h-48 sm:h-64",
    md: "h-72 sm:h-96", 
    lg: "h-96 sm:h-[32rem]"
  };

  return (
    <div
      className={`absolute inset-x-0 top-0 -z-10 pointer-events-none ${heightClasses[height]} ${className}`}
      style={{
        background: "linear-gradient(135deg, var(--primary-tint-1), rgba(167,139,250,0.22))",
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 100%)",
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 100%)",
      }}
    />
  );
}