// Visual pin color per resource category.
export const CATEGORY_PIN: Record<string, { color: string; label: string; emoji: string }> = {
  food: { color: "#16a34a", label: "Food", emoji: "🍎" },
  housing: { color: "#2563eb", label: "Housing", emoji: "🏠" },
  health: { color: "#dc2626", label: "Health", emoji: "🏥" },
  legal: { color: "#7c3aed", label: "Legal", emoji: "⚖️" },
  jobs: { color: "#ea580c", label: "Jobs", emoji: "💼" },
  childcare: { color: "#db2777", label: "Childcare", emoji: "🧸" },
  youth: { color: "#0d9488", label: "Youth", emoji: "🎒" },
  money: { color: "#d97706", label: "Money", emoji: "💰" },
  education: { color: "#1e3a8a", label: "Education", emoji: "📚" },
  nature: { color: "#15803d", label: "Nature & Recreation", emoji: "🌿" },
  art: { color: "#be185d", label: "Art", emoji: "🎨" },
  government: { color: "#475569", label: "Your Voice", emoji: "🏛️" },
  events: { color: "#0891b2", label: "Events", emoji: "🎉" },
  retail: { color: "#a16207", label: "Retail", emoji: "🛍️" },
  services: { color: "#0369a1", label: "Services", emoji: "🧰" },
};

export function pinColor(category: string): string {
  return CATEGORY_PIN[category]?.color ?? "#475569";
}
