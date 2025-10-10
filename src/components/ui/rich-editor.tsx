"use client";
import RichTextarea from "@/components/ui/rich-textarea";

type Props = {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
};

export default function RichEditor({ value = "", onChange, placeholder }: Props) {
  return <RichTextarea value={value} onChange={onChange} placeholder={placeholder} />;
}
