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
  return (
    <TextField
      id={inputId}
      {...props}
      leftIcon={leftIcon}
      className={cn(className)}
      placeholder={props.placeholder ?? label}
      aria-label={label}
    />
  );
}
