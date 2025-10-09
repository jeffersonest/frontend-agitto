"use client";
import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type Props = React.ComponentProps<typeof Input> & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  togglePassword?: boolean;
};

export default function TextField({
  leftIcon,
  rightIcon,
  togglePassword,
  type,
  className,
  ...props
}: Props) {
  const [show, setShow] = React.useState(false);
  const isPassword = togglePassword || type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="relative">
      {leftIcon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--primary)]">
          {leftIcon}
        </span>
      )}
      <Input
        {...props}
        type={inputType}
        className={cn(
          leftIcon ? "pl-10" : "",
          isPassword || rightIcon ? "pr-10" : "",
          className
        )}
      />
      {isPassword ? (
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[color:var(--primary)] hover:text-[color:var(--primary-600)] transition-colors"
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      ) : rightIcon ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--primary)]">
          {rightIcon}
        </span>
      ) : null}
    </div>
  );
}
