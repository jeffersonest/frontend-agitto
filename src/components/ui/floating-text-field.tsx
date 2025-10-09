"use client";
import * as React from "react";
import TextField from "@/components/ui/text-field";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof TextField> & {
  label: string;
};

export default function FloatingTextField({ label, className, id, leftIcon, ...props }: Props) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const hasLeft = Boolean(leftIcon);
  return (
    <div className="relative group">
      <TextField
        id={inputId}
        {...props}
        leftIcon={leftIcon}
        className={cn("placeholder-transparent", className)}
        placeholder={props.placeholder ?? " "}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground transition-all",
          hasLeft ? "left-10" : "left-3",
          "group-has-[input:focus]:top-2 group-has-[input:focus]:text-xs group-has-[input:focus]:text-foreground",
          "group-has-[input:not(:placeholder-shown)]:top-2 group-has-[input:not(:placeholder-shown)]:text-xs"
        )}
      >
        {label}
      </label>
    </div>
  );
}
