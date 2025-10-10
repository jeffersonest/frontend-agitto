export function categoryFromTags(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) return "Esporte";
  const t = (tags[0] || "").toLowerCase();
  if (/(fut|soccer|football)/.test(t)) return "Futebol";
  if (/(basquete|basket)/.test(t)) return "Basquete";
  if (/(natação|swim)/.test(t)) return "Natação";
  if (/(bal(e|é)t|ballet)/.test(t)) return "Balé";
  if (/(corrida|run)/.test(t)) return "Corrida";
  if (/(luta|mma|jiu|karat|muay|boxe|boxing)/.test(t)) return "Luta";
  return capitalize(tags[0]);
}

export function categoryColor(cat: string): string {
  switch (cat) {
    case "Futebol": return "#16a34a";
    case "Basquete": return "#f97316";
    case "Natação": return "#0ea5e9";
    case "Balé": return "#ec4899";
    case "Corrida": return "#22c55e";
    case "Luta": return "#ef4444";
    default: return "#8B5CF6";
  }
}

export function categoryEmoji(cat: string): string {
  switch (cat) {
    case "Futebol": return "⚽";
    case "Basquete": return "🏀";
    case "Natação": return "🏊";
    case "Balé": return "🩰";
    case "Corrida": return "🏃";
    case "Luta": return "🥊";
    default: return "🏅";
  }
}

export function categoryTint(cat: string, alpha = 0.2): string {
  const color = categoryColor(cat);
  // convert hex to rgba with alpha
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function capitalize(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

