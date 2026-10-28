import { Bookmark, Calendar, Home, Landmark, Search, type LucideIcon } from "lucide-react";

/**
 * Navigation is data, not markup: a new feature adds itself here once and
 * shows up in the right place on phone, tablet and desktop.
 */
export type NavItem = {
  to: string;
  /** i18n key for the visible label. */
  labelKey: string;
  icon: LucideIcon;
  /** Other paths that belong to this tab (e.g. Find is lit on /map and listing pages). */
  match?: string[];
};

export type FooterSection = {
  titleKey: string;
  links: { to: string; labelKey: string; soon?: boolean }[];
};

/**
 * The five tabs from docs/product-scope.md, the same in Simplified View
 * (which only makes them bigger). Settings sits behind the profile icon.
 */
export const TABS: NavItem[] = [
  { to: "/", labelKey: "common.navHome", icon: Home },
  {
    to: "/search",
    labelKey: "common.navFind",
    icon: Search,
    match: ["/ask", "/help", "/category", "/map", "/resource"],
  },
  { to: "/events", labelKey: "common.navEvents", icon: Calendar },
  { to: "/civic", labelKey: "common.navTownHall", icon: Landmark },
  { to: "/favorites", labelKey: "common.navSaved", icon: Bookmark, match: ["/lists"] },
];

/** Top-bar links on desktop, where there is no tab bar (the logo is Home). */
export const DESKTOP_NAV: NavItem[] = TABS.filter((tab) => tab.to !== "/");

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
  if (item.to === "/") return pathname === "/";
  return [item.to, ...(item.match ?? [])].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
