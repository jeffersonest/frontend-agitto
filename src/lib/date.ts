export function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.max(0, now.getTime() - d.getTime());
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return "agora";
  const min = Math.floor(sec / 60);
  if (min < 60) return `há ${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `há ${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `há ${day}d`;
  const week = Math.floor(day / 7);
  if (week < 4) return `há ${week}sem`;
  const month = Math.floor(day / 30);
  if (month < 12) return `há ${month}mês`;
  const year = Math.floor(day / 365);
  return `há ${year}a`;
}

