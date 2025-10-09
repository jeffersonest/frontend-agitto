"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fromE164ToLocalDigits, maskBR, toE164BR } from "@/lib/phone/br";

type Props = Omit<React.ComponentProps<typeof Input>, "type" | "onChange" | "value"> & {
  value?: string;
  onChange?: (e164: string) => void;
};

export function PhoneInputBR({ value, onChange, className, ...props }: Props) {
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
        className={cn("pl-16", className)}
        value={display}
        onChange={handleChange}
        placeholder={props.placeholder ?? "(11) 99999-9999"}
        {...props}
      />
    </div>
  );
}

export default PhoneInputBR;
