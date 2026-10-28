// Subcategory taxonomy for each top-level category.
// Used for the subcategory chip filter on category pages.
import { Category } from "./data";

export type SubItem = { id: string; label: string; emoji: string };

export const SUBCATEGORIES_BY_CATEGORY: Partial<Record<Category, SubItem[]>> = {
  health: [
    { id: "primary", label: "Primary Care", emoji: "🩺" },
    { id: "mental", label: "Mental Health", emoji: "🧠" },
    { id: "substance", label: "Substance Use", emoji: "💊" },
    { id: "pregnancy", label: "Pregnancy & Maternal", emoji: "🤰" },
    { id: "disabilities", label: "Disabilities", emoji: "♿" },
    { id: "dental", label: "Dental", emoji: "🦷" },
    { id: "vision", label: "Vision", emoji: "👁️" },
    { id: "lgbtq", label: "LGBTQ+ / Trans Care", emoji: "🏳️‍🌈" },
    { id: "sexual", label: "Sexual Health", emoji: "❤️" },
  ],
  legal: [
    { id: "immigration", label: "Immigration", emoji: "🌐" },
    { id: "housing", label: "Housing / Eviction", emoji: "🏠" },
    { id: "family", label: "Family Law", emoji: "👨‍👩‍👧" },
    { id: "criminal", label: "Criminal", emoji: "⚖️" },
    { id: "employment", label: "Workplace Rights", emoji: "✊" },
    { id: "consumer", label: "Consumer / Debt", emoji: "💳" },
    { id: "translation", label: "Translation / Notary", emoji: "📝" },
  ],
  food: [
    { id: "pantry", label: "Food Pantry", emoji: "🥫" },
    { id: "meals", label: "Prepared Meals", emoji: "🍲" },
    { id: "grocery", label: "Free Groceries", emoji: "🛒" },
    { id: "delivery", label: "Home-Delivered Meals (Seniors/Homebound)", emoji: "🏠" },
    { id: "farmers", label: "Farmers Market / Health Foods", emoji: "🧺" },
    { id: "dining", label: "Restaurants & Dining", emoji: "🍝" },
    { id: "basic", label: "Basic Needs (Clothing, Diapers)", emoji: "🧦" },
  ],
  jobs: [
    { id: "internships", label: "Internships", emoji: "🎒" },
    { id: "training", label: "Job Training & Apprenticeships", emoji: "🎓" },
    { id: "finding", label: "Full-Time / Part-Time Jobs", emoji: "🔎" },
    { id: "self", label: "Self-Employment Resources", emoji: "🧑‍💼" },
  ],
  education: [
    { id: "k12", label: "K-12 Support", emoji: "🎒" },
    { id: "adult", label: "Adult Education", emoji: "📖" },
    { id: "college", label: "College & Financial Aid", emoji: "🎓" },
    { id: "library", label: "Public Libraries", emoji: "📚" },
  ],
  housing: [
    { id: "emergency", label: "Emergency Shelter", emoji: "🛏️" },
    { id: "prevention", label: "Rental Assistance & Prevention", emoji: "💵" },
    { id: "lottery", label: "Affordable Housing Lottery", emoji: "🏢" },
    { id: "rights", label: "Tenant Rights", emoji: "✊" },
  ],
  childcare: [
    { id: "daycare", label: "Daycare", emoji: "🧸" },
    { id: "prek", label: "Pre-K", emoji: "✏️" },
    { id: "afterschool", label: "After-School", emoji: "📚" },
  ],
  nature: [
    { id: "hiking_trail", label: "Hiking Trails", emoji: "🥾" },
    { id: "park", label: "Parks", emoji: "🌳" },
    { id: "water", label: "Water Activities", emoji: "🛶" },
    { id: "recreation", label: "Outdoor Recreation", emoji: "🐎" },
    { id: "fitness", label: "Fitness & Wellness", emoji: "🧘" },
    { id: "sports", label: "Sports Facilities", emoji: "⚽" },
  ],
  art: [
    { id: "museum", label: "Museums & Galleries", emoji: "🖼️" },
    { id: "arts_org", label: "Arts Organizations", emoji: "🎭" },
    { id: "workshop", label: "Workshops & Classes", emoji: "✍️" },
    { id: "performing", label: "Performing Arts", emoji: "🎤" },
  ],
};
