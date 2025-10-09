export function onlyDigits(v: string): string {
  return (v || "").replace(/\D/g, "");
}

export function maskBR(localDigits: string): string {
  const d = onlyDigits(localDigits).slice(0, 11);
  if (d.length <= 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function toE164BR(input: string): string {
  const d = onlyDigits(input);
  const withoutCC = d.startsWith("55") ? d.slice(2) : d;
  const local = withoutCC.slice(0, 11);
  return local ? `+55${local}` : "";
}

export function fromE164ToLocalDigits(e164OrLocal: string): string {
  const d = onlyDigits(e164OrLocal);
  return d.startsWith("55") ? d.slice(2) : d;
}
