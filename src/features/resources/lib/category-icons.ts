import {
  Backpack,
  Baby,
  Briefcase,
  CalendarDays,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  Palette,
  Scale,
  ShoppingBag,
  Trees,
  Utensils,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/data";

/** One line icon per category, used instead of emoji wherever a category is shown. */
export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  food: Utensils,
  housing: House,
  health: HeartPulse,
  legal: Scale,
  education: GraduationCap,
  money: Wallet,
  childcare: Baby,
  youth: Backpack,
  jobs: Briefcase,
  nature: Trees,
  art: Palette,
  government: Landmark,
  events: CalendarDays,
  retail: ShoppingBag,
  services: Wrench,
};
