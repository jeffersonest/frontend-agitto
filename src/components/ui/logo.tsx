import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "black" | "white" | "auto";
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ 
  variant = "auto", 
  className = "", 
  width = 120, 
  height = 40 
}: LogoProps) {
  if (variant === "auto") {
    return (
      <>
        {/* Logo preto para modo claro */}
        <Image
          src="/logo-black.svg"
          alt="Agitto"
          width={width}
          height={height}
          className={cn("object-contain dark:hidden", className)}
          priority
        />
        {/* Logo branco para modo escuro */}
        <Image
          src="/logo-white.svg"
          alt="Agitto"
          width={width}
          height={height}
          className={cn("object-contain hidden dark:block", className)}
          priority
        />
      </>
    );
  }

  const logoSrc = variant === "white" ? "/logo-white.svg" : "/logo-black.svg";
  
  return (
    <Image
      src={logoSrc}
      alt="Agitto"
      width={width}
      height={height}
      className={cn("object-contain", className)}
      priority
    />
  );
}

export default Logo;