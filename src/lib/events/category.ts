export function categoryFromTags(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) return "Esporte";
  const t = (tags[0] || "").toLowerCase();
  
  if (/(fut|soccer|football)/.test(t)) return "Futebol";
  if (/(basquete|basket)/.test(t)) return "Basquete";
  if (/(voley|volei|volleyball)/.test(t)) return "Vôlei";
  if (/(tenis|tennis)/.test(t)) return "Tênis";
  if (/(handball|handebol)/.test(t)) return "Handebol";
  if (/(rugby)/.test(t)) return "Rugby";
  if (/(ping.?pong|tenis.?mesa)/.test(t)) return "Tênis de Mesa";
  if (/(futsal)/.test(t)) return "Futsal";
  
  if (/(natação|swim)/.test(t)) return "Natação";
  if (/(surf)/.test(t)) return "Surf";
  if (/(vela|sailing)/.test(t)) return "Vela";
  if (/(mergulho|diving)/.test(t)) return "Mergulho";
  if (/(polo.?aquatico)/.test(t)) return "Polo Aquático";
  
  if (/(corrida|run|marathon|maratona)/.test(t)) return "Corrida";
  if (/(atletismo|track)/.test(t)) return "Atletismo";
  if (/(ciclismo|bike|bicicleta|cycling)/.test(t)) return "Ciclismo";
  if (/(caminhada|walk|hiking)/.test(t)) return "Caminhada";
  if (/(triathlon|ironman)/.test(t)) return "Triathlon";
  
  if (/(luta|mma|jiu|karat|muay|boxe|boxing)/.test(t)) return "Luta";
  if (/(judo)/.test(t)) return "Judô";
  if (/(taekwondo)/.test(t)) return "Taekwondo";
  if (/(capoeira)/.test(t)) return "Capoeira";
  
  if (/(academia|gym|fitness|musculação)/.test(t)) return "Academia";
  if (/(yoga)/.test(t)) return "Yoga";
  if (/(pilates)/.test(t)) return "Pilates";
  if (/(crossfit)/.test(t)) return "CrossFit";
  if (/(funcional|functional)/.test(t)) return "Treino Funcional";
  if (/(dança|dance)/.test(t)) return "Dança Esportiva";
  if (/(bal(e|é)t|ballet)/.test(t)) return "Balé";
  
  if (/(skate|skateboard)/.test(t)) return "Skate";
  if (/(escalada|climbing)/.test(t)) return "Escalada";
  if (/(parkour)/.test(t)) return "Parkour";
  if (/(parapente|paragliding)/.test(t)) return "Parapente";
  if (/(rapel|rappel)/.test(t)) return "Rapel";
  if (/(motocross|moto)/.test(t)) return "Motocross";
  
  if (/(tiro|shooting)/.test(t)) return "Tiro Esportivo";
  if (/(arco|archery)/.test(t)) return "Tiro com Arco";
  if (/(golf)/.test(t)) return "Golf";
  if (/(boliche|bowling)/.test(t)) return "Boliche";
  
  if (/(esqui|ski)/.test(t)) return "Esqui";
  if (/(patinação|skating)/.test(t)) return "Patinação";
  
  if (/(beach|praia)/.test(t)) return "Esporte de Praia";
  if (/(frescobol)/.test(t)) return "Frescobol";
  if (/(beach.?volleyball|volei.?praia)/.test(t)) return "Vôlei de Praia";
  
  if (/(squash)/.test(t)) return "Squash";
  if (/(badminton)/.test(t)) return "Badminton";
  
  if (/(hipismo|equestre|cavalo)/.test(t)) return "Hipismo";
  
  if (/(ginastica|gymnastics)/.test(t)) return "Ginástica";
  
  return capitalize(tags[0]);
}

export function categoryColor(category: string): string {
  switch (category) {
    case "Futebol": return "bg-green-500";
    case "Basquete": return "bg-orange-500";
    case "Vôlei": return "bg-yellow-500";
    case "Tênis": return "bg-emerald-500";
    case "Handebol": return "bg-blue-500";
    case "Rugby": return "bg-purple-600";
    case "Tênis de Mesa": return "bg-pink-500";
    case "Futsal": return "bg-green-600";
    case "Vôlei de Praia": return "bg-amber-500";
    case "Natação": return "bg-cyan-500";
    case "Surf": return "bg-blue-400";
    case "Vela": return "bg-sky-500";
    case "Mergulho": return "bg-blue-700";
    case "Polo Aquático": return "bg-teal-500";
    case "Corrida": return "bg-red-500";
    case "Atletismo": return "bg-orange-600";
    case "Ciclismo": return "bg-lime-500";
    case "Caminhada": return "bg-green-400";
    case "Triathlon": return "bg-indigo-500";
    case "Luta": return "bg-red-600";
    case "Judô": return "bg-slate-600";
    case "Taekwondo": return "bg-gray-600";
    case "Capoeira": return "bg-yellow-600";
    case "Academia": return "bg-violet-500";
    case "Yoga": return "bg-purple-400";
    case "Pilates": return "bg-rose-500";
    case "CrossFit": return "bg-red-700";
    case "Treino Funcional": return "bg-orange-700";
    case "Dança Esportiva": return "bg-pink-400";
    case "Balé": return "bg-rose-400";
    case "Skate": return "bg-zinc-600";
    case "Escalada": return "bg-stone-600";
    case "Parkour": return "bg-neutral-600";
    case "Parapente": return "bg-sky-400";
    case "Rapel": return "bg-slate-700";
    case "Motocross": return "bg-amber-700";
    case "Tiro Esportivo": return "bg-gray-700";
    case "Tiro com Arco": return "bg-emerald-600";
    case "Golf": return "bg-green-700";
    case "Boliche": return "bg-blue-600";
    case "Esqui": return "bg-slate-400";
    case "Patinação": return "bg-cyan-400";
    case "Esporte de Praia": return "bg-yellow-400";
    case "Frescobol": return "bg-orange-400";
    case "Squash": return "bg-purple-500";
    case "Badminton": return "bg-lime-400";
    case "Hipismo": return "bg-amber-600";
    case "Ginástica": return "bg-pink-600";
    default: return "bg-blue-500";
  }
}

export function categoryEmoji(cat: string): string {
  switch (cat) {
    case "Futebol": return "⚽";
    case "Basquete": return "🏀";
    case "Vôlei": return "🏐";
    case "Tênis": return "🎾";
    case "Handebol": return "🤾";
    case "Rugby": return "🏉";
    case "Tênis de Mesa": return "🏓";
    case "Futsal": return "⚽";
    case "Natação": return "🏊";
    case "Surf": return "🏄";
    case "Vela": return "⛵";
    case "Mergulho": return "🤿";
    case "Polo Aquático": return "🤽";
    case "Corrida": return "🏃";
    case "Atletismo": return "🏃";
    case "Ciclismo": return "🚴";
    case "Caminhada": return "🚶";
    case "Triathlon": return "🏊";
    case "Luta": return "🥊";
    case "Judô": return "🥋";
    case "Taekwondo": return "🥋";
    case "Capoeira": return "🤸";
    case "Academia": return "💪";
    case "Yoga": return "🧘";
    case "Pilates": return "🤸‍♀️";
    case "CrossFit": return "🏋️";
    case "Treino Funcional": return "🏃‍♀️";
    case "Dança Esportiva": return "💃";
    case "Balé": return "🩰";
    case "Skate": return "🛹";
    case "Escalada": return "🧗";
    case "Parkour": return "🤸‍♂️";
    case "Parapente": return "🪂";
    case "Rapel": return "🧗‍♀️";
    case "Motocross": return "🏍️";
    case "Tiro Esportivo": return "🎯";
    case "Tiro com Arco": return "🏹";
    case "Golf": return "⛳";
    case "Boliche": return "🎳"; 
    case "Esqui": return "⛷️";
    case "Patinação": return "⛸️";
    case "Esporte de Praia": return "🏖️";
    case "Frescobol": return "🏓";
    case "Vôlei de Praia": return "🏐";
    case "Squash": return "🎾";
    case "Badminton": return "🏸";
    case "Hipismo": return "🐎";
    case "Ginástica": return "🤸";
    
    default: return "🏅";
  }
}

export function categoryColorHex(category: string): string {
  switch (category) {
    case "Futebol": return "#22c55e";
    case "Basquete": return "#f97316";
    case "Vôlei": return "#eab308";
    case "Tênis": return "#10b981";
    case "Handebol": return "#3b82f6";
    case "Rugby": return "#9333ea";
    case "Tênis de Mesa": return "#ec4899";
    case "Futsal": return "#16a34a";
    case "Vôlei de Praia": return "#f59e0b";
    case "Natação": return "#06b6d4";
    case "Surf": return "#60a5fa";
    case "Vela": return "#0ea5e9";
    case "Mergulho": return "#1d4ed8";
    case "Polo Aquático": return "#14b8a6";
    case "Corrida": return "#ef4444";
    case "Atletismo": return "#ea580c";
    case "Ciclismo": return "#84cc16";
    case "Caminhada": return "#4ade80";
    case "Triathlon": return "#6366f1";
    case "Luta": return "#dc2626";
    case "Judô": return "#475569";
    case "Taekwondo": return "#4b5563";
    case "Capoeira": return "#ca8a04";
    case "Academia": return "#8b5cf6";
    case "Yoga": return "#c084fc";
    case "Pilates": return "#f43f5e";
    case "CrossFit": return "#b91c1c";
    case "Treino Funcional": return "#c2410c";
    case "Dança Esportiva": return "#f472b6";
    case "Balé": return "#fb7185";
    case "Skate": return "#52525b";
    case "Escalada": return "#57534e";
    case "Parkour": return "#525252";
    case "Parapente": return "#38bdf8";
    case "Rapel": return "#334155";
    case "Motocross": return "#b45309";
    case "Tiro Esportivo": return "#374151";
    case "Tiro com Arco": return "#059669";
    case "Golf": return "#15803d";
    case "Boliche": return "#2563eb";
    case "Esqui": return "#94a3b8";
    case "Patinação": return "#22d3ee";
    case "Esporte de Praia": return "#facc15";
    case "Frescobol": return "#fb923c";
    case "Squash": return "#a855f7";
    case "Badminton": return "#a3e635";
    case "Hipismo": return "#d97706";
    case "Ginástica": return "#db2777";
    default: return "#3b82f6";
  }
}

export function categoryTint(cat: string, alpha = 0.2): string {
  const color = categoryColorHex(cat);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getCategoryType(cat: string): 'sport' | 'health' {
  const sportCategories = [
    "Futebol", "Basquete", "Vôlei", "Tênis", "Handebol", "Rugby", "Tênis de Mesa", "Futsal",
    "Natação", "Surf", "Vela", "Mergulho", "Polo Aquático",
    "Corrida", "Atletismo", "Ciclismo", "Caminhada", "Triathlon",
    "Luta", "Judô", "Taekwondo", "Capoeira",
    "Academia", "CrossFit", "Treino Funcional",
    "Skate", "Escalada", "Parkour", "Parapente", "Rapel", "Motocross",
    "Tiro Esportivo", "Tiro com Arco", "Golf", "Boliche",
    "Esqui", "Patinação", "Esporte de Praia", "Frescobol", "Vôlei de Praia",
    "Squash", "Badminton", "Hipismo", "Ginástica", "Dança Esportiva", "Balé", "Esporte"
  ];
  
  const healthCategories = ["Yoga", "Pilates"];
  
  if (sportCategories.includes(cat)) return 'sport';
  if (healthCategories.includes(cat)) return 'health';
  return 'sport'; 
}

export function getAllCategories(): Array<{name: string, color: string, emoji: string, type: string}> {
  const categories = [
    "Futebol", "Basquete", "Vôlei", "Corrida", "Academia", "Natação",
    "Tênis", "Ciclismo", "Luta", "Yoga", "Dança Esportiva", "Skate",
    "Handebol", "Rugby", "Tênis de Mesa", "Futsal", "Surf", "Golf",
    "Atletismo", "Triathlon", "CrossFit", "Escalada", "Tiro Esportivo"
  ];
  
  return categories.map(cat => ({
    name: cat,
    color: categoryColor(cat),
    emoji: categoryEmoji(cat),
    type: getCategoryType(cat)
  }));
}

function capitalize(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

