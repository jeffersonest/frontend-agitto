"use client";
import { getAllCategories, getCategoryType } from "@/lib/events/category";

export default function CategoryPreview() {
  const categories = getAllCategories();
  const groupedByType = categories.reduce((acc, cat) => {
    const type = getCategoryType(cat.name);
    if (!acc[type]) acc[type] = [];
    acc[type].push(cat);
    return acc;
  }, {} as Record<string, typeof categories>);

  const typeLabels = {
    sport: "🏅 Esportes",
    health: "💚 Saúde & Bem-estar", 
    cultural: "🎭 Arte & Cultura",
    business: "💼 Negócios & Tech",
    social: "🤝 Social & Outros"
  };

  return (
    <div className="p-6 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Categorias de Eventos</h2>
        <p className="text-muted-foreground">
          {categories.length} categorias disponíveis com cores e emojis únicos
        </p>
      </div>

      {Object.entries(groupedByType).map(([type, cats]) => (
        <div key={type} className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground/80">
            {typeLabels[type as keyof typeof typeLabels]}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {cats.map((cat) => (
              <div
                key={cat.name}
                className="flex flex-col items-center p-3 rounded-xl border transition-all hover:shadow-md cursor-pointer"
                style={{ 
                  backgroundColor: cat.color + "10",
                  borderColor: cat.color + "30"
                }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl mb-2"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.emoji}
                </div>
                <span className="text-sm font-medium text-center leading-tight">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}