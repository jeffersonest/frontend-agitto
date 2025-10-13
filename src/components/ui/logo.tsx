import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "black" | "white" | "auto";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  animated?: boolean;
}

export function Logo({ variant = "auto", className = "", size = "md", animated = false }: LogoProps) {
  const dims = {
    sm: { width: 100, height: 32, hClass: "h-8" },
    md: { width: 140, height: 48, hClass: "h-12" },
    lg: { width: 180, height: 60, hClass: "h-14" },
    xl: { width: 220, height: 72, hClass: "h-18" },
    xxl: { width: 260, height: 84, hClass: "h-20" },
  }[size];

  const animationProps = animated ? {
    initial: { opacity: 0, scale: 0.8, y: -20 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
    },
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
    whileHover: { 
      scale: 1.05,
      transition: { duration: 0.3 }
    }
  } : {};

  const LogoImage = ({ src, alt, isDark = false }: { src: string, alt: string, isDark?: boolean }) => (
    <Image
      src={src}
      alt={alt}
      width={dims.width}
      height={dims.height}
      className={cn(
        "object-contain", 
        dims.hClass, 
        isDark ? "hidden dark:block" : "dark:hidden",
        className
      )}
      priority
    />
  );

  if (variant === "auto") {
    if (animated) {
      return (
        <motion.div {...animationProps}>
          <LogoImage src="/logo-black.svg" alt="Agitto" />
          <LogoImage src="/logo-white.svg" alt="Agitto" isDark />
        </motion.div>
      );
    }
    return (
      <>
        {/* Logo preto para modo claro */}
        <Image
          src="/logo-black.svg"
          alt="Agitto"
          width={dims.width}
          height={dims.height}
          className={cn("object-contain dark:hidden", dims.hClass, className)}
          priority
        />
        {/* Logo branco para modo escuro */}
        <Image
          src="/logo-white.svg"
          alt="Agitto"
          width={dims.width}
          height={dims.height}
          className={cn("object-contain hidden dark:block", dims.hClass, className)}
          priority
        />
      </>
    );
  }

  const logoSrc = variant === "white" ? "/logo-white.svg" : "/logo-black.svg";
  
  if (animated) {
    return (
      <motion.div {...animationProps}>
        <Image
          src={logoSrc}
          alt="Agitto"
          width={dims.width}
          height={dims.height}
          className={cn("object-contain", dims.hClass, className)}
          priority
        />
      </motion.div>
    );
  }
  
  return (
    <Image
      src={logoSrc}
      alt="Agitto"
      width={dims.width}
      height={dims.height}
      className={cn("object-contain", dims.hClass, className)}
      priority
    />
  );
}

export default Logo;
