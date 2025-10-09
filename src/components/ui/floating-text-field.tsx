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
    <div className="relative">
      <TextField
        id={inputId}
        {...props}
        leftIcon={leftIcon}
        className={cn("peer placeholder-transparent", className)}
        placeholder={props.placeholder ?? " "}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground transition-all",
          hasLeft ? "left-10" : "left-3",
          // float on focus or when not placeholder-shown
          "peer-focus:top-2 peer-focus:text-xs peer-focus:text-foreground",
          "peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs"
        )}
      >
        {label}
      </label>
    </div>
  );
}

