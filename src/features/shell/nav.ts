import {
  Bell,
  Briefcase,
  Calendar,
  Home,
  Inbox,
  LayoutGrid,
  ListPlus,
  Map,
  Newspaper,
  Settings,
  Star,
  type LucideIcon,
} from "lucide-react";

/**
 * Navigation is data, not markup: a new feature adds itself here once and
 * shows up in the right place on phone, tablet and desktop.
 */
export type NavItem = {
  to: string;
  /** i18n key for the visible label. */
  labelKey: string;
  icon: LucideIcon;
};

export type FooterSection = {
  titleKey: string;
  links: { to: string; labelKey: string; soon?: boolean }[];
};

/** Bottom tab bar (phones and tablets). Keep it to five or fewer. */
export const TABS: NavItem[] = [
  { to: "/", labelKey: "common.navHome", icon: Home },
  { to: "/map", labelKey: "common.navMap", icon: Map },
  { to: "/favorites", labelKey: "common.navFavorites", icon: Star },
  { to: "/buzz", labelKey: "common.navBuzz", icon: Bell },
  { to: "/settings", labelKey: "common.navSettings", icon: Settings },
];

/** Simplified View trades tabs for bigger targets: four, task-named. */
export const SIMPLIFIED_TABS: NavItem[] = [
  { to: "/", labelKey: "common.navHome", icon: Home },
  { to: "/map", labelKey: "common.navMap", icon: Map },
  { to: "/buzz", labelKey: "common.navEvents", icon: Calendar },
  { to: "/search", labelKey: "common.navServices", icon: LayoutGrid },
];

/** Top-bar links on desktop, where there is no tab bar. */
export const DESKTOP_NAV: NavItem[] = [
  { to: "/digest", labelKey: "shell.thisWeek", icon: Newspaper },
  { to: "/map", labelKey: "common.navMap", icon: Map },
  { to: "/lists", labelKey: "common.navLists", icon: ListPlus },
  { to: "/pro", labelKey: "common.navPro", icon: Briefcase },
  { to: "/request-resource", labelKey: "common.navRequest", icon: Inbox },
];

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    titleKey: "appName",
    links: [
      { to: "/about", labelKey: "common.footerAbout" },
      { to: "/how-to-add", labelKey: "common.footerHowToAdd" },
      { to: "/portal", labelKey: "common.footerListOrg" },
      { to: "/advertise", labelKey: "common.footerAdvertise" },
      { to: "/faq", labelKey: "common.footerFaq" },
      { to: "/contact", labelKey: "common.footerContact" },
    ],
  },
  {
    titleKey: "common.footerLegal",
    links: [
      { to: "/privacy", labelKey: "common.footerPrivacy" },
      { to: "/terms", labelKey: "common.footerTerms" },
    ],
  },
  {
    titleKey: "common.footerCommunity",
    links: [
      { to: "/events", labelKey: "common.navEvents" },
      { to: "/civic", labelKey: "common.footerYourVoice" },
      { to: "/businesses", labelKey: "common.footerBusinesses" },
      { to: "/creators", labelKey: "common.footerPicks" },
      { to: "/roadmap", labelKey: "common.footerStartBusiness", soon: true },
      { to: "/urgent", labelKey: "common.footerUrgent" },
    ],
  },
];

export function isActive(item: NavItem, pathname: string): boolean {
  return item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
}
