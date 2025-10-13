export function shortName(fullName: string | null | undefined): string {
  const raw = (fullName || "").trim();
  if (!raw) return "";
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return raw;
  return `${parts[0]} ${parts[1]} …`;
}

