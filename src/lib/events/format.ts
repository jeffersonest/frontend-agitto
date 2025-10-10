export function formatEventDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const date = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(d).replace(".", "");
  const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(d);
  return `${date} • ${time}`;
}

export function formatLocationShort(name?: string | null, address?: string | null): string {
  if (name && name.trim()) return name.trim();
  if (!address) return "";
  // Try to extract "Bairro, Cidade – UF" from address string
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 3) {
    const bairro = parts[1];
    const cidadeUF = parts[2];
    return `${bairro}, ${cidadeUF}`;
  }
  return address;
}

export function composeISO(dateStr?: string, timeStr?: string): string | undefined {
  if (!dateStr) return undefined;
  const time = timeStr && timeStr.length > 0 ? timeStr : "00:00";
  const d = new Date(`${dateStr}T${time}`);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

