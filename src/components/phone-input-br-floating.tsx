"use client";
import * as React from "react";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { fromE164ToLocalDigits, maskBR, toE164BR } from "@/lib/phone/br";

type Props = Omit<React.ComponentProps<typeof Input>, "type" | "onChange" | "value" | "placeholder"> & {
  label: string;
  value?: string;
  onChange?: (e164: string) => void;
};

export default function FloatingPhoneInputBR({ label, value, onChange, className, id, ...props }: Props) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const localDigits = React.useMemo(() => fromE164ToLocalDigits(value || ""), [value]);
  const display = React.useMemo(() => maskBR(localDigits), [localDigits]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nextE164 = toE164BR(e.target.value);
    onChange?.(nextE164);
  }

  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--primary)]">
        <Phone size={16} />
      </span>
      <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 select-none text-sm text-foreground/70">
        +55
      </span>
      <Input
        type="tel"
        inputMode="numeric"
        className={cn("pl-16 peer placeholder-transparent", props.className)}
        value={display}
        onChange={handleChange}
        placeholder=" "
        {...props}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 left-16 text-muted-foreground transition-all",
          "peer-focus:top-2 peer-focus:text-xs peer-focus:text-foreground",
          "peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs"
        )}
      >
        {label}
      </label>
    </div>
  );
}

