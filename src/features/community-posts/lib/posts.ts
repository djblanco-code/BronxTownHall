/**
 * Hard-coded community posts, shown alongside live data for now (the owner
 * asked for real example content on the site). They are real Northeast Bronx
 * (Council District 12) events and announcements from the Council Member's
 * October 2026 constituent newsletter, with their real dates, and they are
 * attributed on the page. They skip the admin review flow (AGENTS.md), so
 * move them into the events table through review when that is ready, then
 * delete this file. Past events drop off by date.
 */

/** Shown with every post so residents know where it came from. */
export const POST_SOURCE = "Council Member Riley's District 12 newsletter";

export type CommunityEvent = {
  id: string;
  title: string;
  description: string;
  event_type: "block_party" | "festival" | "arts_culture" | "recreation" | "holiday" | "other";
  category: string;
  event_date: string;
  event_end_date: string | null;
  event_time: string | null;
  location: string;
  address: string | null;
  neighborhood: string;
  is_free: boolean;
  website: string | null;
  /** The organizer's flyer, once added under /public/images/events. */
  image?: string;
};

export const COMMUNITY_EVENTS: CommunityEvent[] = [
  {
    id: "demo-cleanup-dyre",
    title: "Community clean-up on Dyre Avenue",
    description:
      "A morning of neighborhood beautification with Assembly Speaker Heastie, Council Member Riley and community partners. Wear comfortable clothes and sneakers. Questions: 718-654-6539.",
    event_type: "other",
    category: "community",
    event_date: "2026-10-24",
    event_end_date: null,
    event_time: "9:00 AM – 11:00 AM",
    location: "Dyre Avenue, in front of Dyre Avenue Diner",
    address: "Dyre Ave, Bronx, NY 10466",
    neighborhood: "Eastchester",
    is_free: true,
    website: null,
  },
  {
    id: "demo-career-day-47",
    title: "47th Precinct Career Resource Day",
    description:
      "Explore career paths, meet business owners, and get résumé and interview help. Presented by the 47th Precinct Neighborhood Safety Council.",
    event_type: "other",
    category: "jobs",
    event_date: "2026-10-24",
    event_end_date: null,
    event_time: "12:00 PM – 3:00 PM",
    location: "MMCC Edenwald Community Center",
    address: "1150 East 229th Street, Bronx, NY 10466",
    neighborhood: "Edenwald",
    is_free: true,
    website: null,
  },
  {
    id: "demo-breast-cancer-walk",
    title: "2026 Breast Cancer Walk at Orchard Beach",
    description:
      "Walk together in support of everyone affected by breast cancer. Meet-up 7:30 AM at the Orchard Beach Pavilion; the walk starts at 8:00 AM.",
    event_type: "recreation",
    category: "health",
    event_date: "2026-10-25",
    event_end_date: null,
    event_time: "7:30 AM",
    location: "Orchard Beach Pavilion",
    address: "1 Orchard Beach Road, Bronx, NY 10464",
    neighborhood: "Pelham Bay",
    is_free: true,
    website: null,
  },
  {
    id: "demo-energy-conversation",
    title: "Community conversation: weatherization and energy efficiency",
    description:
      "Learn how to insulate your home and save on energy bills. Free on-site child watch. Doors open 5:30 PM. Questions: 718-684-5509.",
    event_type: "other",
    category: "housing",
    event_date: "2026-10-26",
    event_end_date: null,
    event_time: "6:30 PM",
    location: "Bronx Bethany Church of the Nazarene, Community Room",
    address: "963 East 227th Street, Bronx, NY 10466",
    neighborhood: "Williamsbridge",
    is_free: true,
    website: null,
  },
  {
    id: "demo-trunk-or-treat",
    title: "Trunk or Treat at the Northeast Bronx YMCA",
    description:
      "Pumpkin patch, haunted maze, arts and crafts, candy and a surprise DJ, while supplies last. Questions: mgough@ymcanyc.org.",
    event_type: "holiday",
    category: "family",
    event_date: "2026-10-31",
    event_end_date: null,
    event_time: "1:00 PM – 3:00 PM",
    location: "Northeast Bronx YMCA",
    address: "1250 East 229th Street, Bronx, NY 10466",
    neighborhood: "Williamsbridge",
    is_free: true,
    website: null,
  },
  {
    id: "demo-ymca-food-nov5",
    title: "Free fresh food distribution (YMCA and GrowNYC)",
    description:
      "Fresh, locally sourced food, first come, first served while supplies last. Bring reusable totes or a shopping cart.",
    event_type: "other",
    category: "food",
    event_date: "2026-11-05",
    event_end_date: null,
    event_time: "10:00 AM",
    location: "Northeast Bronx YMCA",
    address: "1250 East 229th Street, Bronx, NY 10466",
    neighborhood: "Williamsbridge",
    is_free: true,
    website: null,
  },
  {
    id: "demo-ymca-food-nov19",
    title: "Free fresh food distribution (YMCA and GrowNYC)",
    description:
      "Fresh, locally sourced food, first come, first served while supplies last. Bring reusable totes or a shopping cart.",
    event_type: "other",
    category: "food",
    event_date: "2026-11-19",
    event_end_date: null,
    event_time: "10:00 AM",
    location: "Northeast Bronx YMCA",
    address: "1250 East 229th Street, Bronx, NY 10466",
    neighborhood: "Williamsbridge",
    is_free: true,
    website: null,
  },
  {
    id: "demo-participatory-budgeting",
    title: "Share ideas for $1 million in District 12 projects",
    description:
      "Participatory Budgeting (Cycle 16): suggest improvements to schools, parks, libraries, public housing or streets. Residents vote on projects next spring.",
    event_type: "other",
    category: "government",
    event_date: "2026-10-01",
    event_end_date: "2026-11-30",
    event_time: null,
    location: "Online",
    address: null,
    neighborhood: "Northeast Bronx",
    is_free: true,
    website: "https://rnd.council.nyc.gov/ideamap/",
  },
];

/** Announcements shown in Town Hall's "Latest from your officials". */
export const COMMUNITY_UPDATES = [
  {
    id: "demo-update-pb",
    office: "Office of Council Member Kevin C. Riley (District 12)",
    body: "How would you spend $1 million in your neighborhood? Share your Participatory Budgeting ideas through November at rnd.council.nyc.gov/ideamap. Residents vote next spring.",
    created_at: "2026-10-22T14:00:00Z",
  },
  {
    id: "demo-update-somos",
    office: "Office of Council Member Kevin C. Riley (District 12)",
    body: "Medicaid members: the SOMOS Social Care Network at Mosholu Montefiore Community Center can help with housing and eviction prevention, food, rides to medical visits and job training, in English and Spanish. Call 917-903-9586.",
    created_at: "2026-10-22T14:00:00Z",
  },
  {
    id: "demo-update-wpr-plan",
    office: "Office of Council Member Kevin C. Riley (District 12)",
    body: "Learn about the White Plains Road Neighborhood Plan at nyc.gov/whiteplainsroad and join NYC Planning's virtual office hours.",
    created_at: "2026-10-22T14:00:00Z",
  },
];

/** Deadlines shown on Home. */
export const COMMUNITY_DEADLINES = [
  {
    id: "demo-deadline-pb",
    category: "government",
    kind: "deadline" as const,
    headline: "Participatory Budgeting ideas for District 12 are due",
    detail: null,
    source_url: "https://rnd.council.nyc.gov/ideamap/",
    source_label: "NYC Council",
    deadline_date: "2026-11-30",
    published: true,
    published_at: "2026-10-22T14:00:00Z",
    expires_at: null,
    created_at: "2026-10-22T14:00:00Z",
  },
];

/** Events that haven't ended yet (YYYY-MM-DD `today`), soonest first. */
export function upcomingCommunityEvents(today: string): CommunityEvent[] {
  return COMMUNITY_EVENTS.filter((e) => (e.event_end_date ?? e.event_date) >= today).sort((a, b) =>
    a.event_date.localeCompare(b.event_date),
  );
}

/** A post's description with where it came from, for full event cards. */
export function describeWithSource(e: CommunityEvent): string {
  return `${e.description} Source: ${POST_SOURCE}. Check with the organizer before going.`;
}
