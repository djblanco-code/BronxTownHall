// Static content for the Bronx Entrepreneur Hub. Edit here to update the app.

export type RoadmapStep = {
  key: "idea" | "plan" | "fund" | "launch" | "grow";
  emoji: string;
  title: string;
  summary: string;
  checklist: string[];
};

export const ROADMAP: RoadmapStep[] = [
  {
    key: "idea",
    emoji: "💡",
    title: "Idea",
    summary: "Shape your concept and validate it with real Bronx customers.",
    checklist: [
      "Write a 1-sentence description of what you sell and who you serve",
      "Talk to 10 potential customers (neighbors, family, coworkers)",
      "Check if similar businesses already exist nearby",
      "Estimate startup costs on a napkin",
    ],
  },
  {
    key: "plan",
    emoji: "📝",
    title: "Plan",
    summary: "Turn the idea into a real plan a bank or grantor will take seriously.",
    checklist: [
      "Draft a 1-page business plan (template below)",
      "Choose a legal structure (LLC, sole prop, corp)",
      "Book a free advising session with Bronx SBDC",
      "Register your business name / DBA with NY State",
    ],
  },
  {
    key: "fund",
    emoji: "💰",
    title: "Fund",
    summary: "Line up the money — grants first, loans second.",
    checklist: [
      "Apply to at least 2 Bronx-eligible grants (see directory)",
      "Open a business bank account",
      "Get your EIN from the IRS (free, ~10 min online)",
      "Talk to BXEDC or Accion about micro-loans if you need capital",
    ],
  },
  {
    key: "launch",
    emoji: "🚀",
    title: "Launch",
    summary: "Get legal, get insured, open your doors.",
    checklist: [
      "Get required NYC permits & licenses (SBS can help)",
      "Buy general liability insurance",
      "Set up POS / online payments",
      "Announce your opening — list yourself on The Bronx App!",
    ],
  },
  {
    key: "grow",
    emoji: "📈",
    title: "Grow",
    summary: "Bring in customers, hire Bronx residents, keep the books.",
    checklist: [
      "Claim your listing on The Bronx App to reach neighbors",
      "Post your first job to hire locally",
      "Ask 5 happy customers for reviews this month",
      "Set aside 15 min/week to check your numbers",
    ],
  },
];

export type Grant = {
  id: string;
  name: string;
  amount: string;
  deadline: string;
  eligibility: string;
  url: string;
};

export const GRANTS: Grant[] = [
  {
    id: "capital-one-community",
    name: "Capital One Community Grant",
    amount: "Varies",
    deadline: "Rolling",
    eligibility: "Bronx-based small businesses & nonprofits",
    url: "https://www.capitalone.com/about/impact-initiatives/",
  },
  {
    id: "rising-restaurateur",
    name: "Rising Restaurateur Grant",
    amount: "$10,000",
    deadline: "Annual (spring)",
    eligibility: "Latino-owned food businesses",
    url: "https://www.hispanicfederation.org/",
  },
  {
    id: "emigrant-bank",
    name: "Emigrant Bank 1850 Fund Grant",
    amount: "Up to $10,000",
    deadline: "Annual (fall)",
    eligibility: "Low-to-moderate income NYC entrepreneurs",
    url: "https://www.emigrant.com/",
  },
  {
    id: "nyc-sbs-opportunity",
    name: "NYC Small Business Opportunity Fund",
    amount: "Up to $250,000 loan",
    deadline: "Rolling (waitlist)",
    eligibility: "NYC small businesses, priority to underserved",
    url: "https://www.nyc.gov/site/sbs/businesses/opportunityfund.page",
  },
  {
    id: "bronx-community-foundation",
    name: "Bronx Community Foundation — Business Grants",
    amount: "$2,500 – $25,000",
    deadline: "Quarterly cycles",
    eligibility: "Bronx-based businesses & nonprofits",
    url: "https://thebronx.org/",
  },
];

export type Advisor = {
  id: string;
  name: string;
  what: string;
  address: string;
  phone: string;
  url: string;
};

export const ADVISORS: Advisor[] = [
  {
    id: "bronx-sbdc",
    name: "Bronx SBDC (at Lehman College)",
    what: "Free 1:1 business advising, plan review, financial coaching",
    address: "250 Bedford Park Blvd W, Bronx, NY 10468",
    phone: "718-960-8806",
    url: "https://www.lehman.edu/sbdc/",
  },
  {
    id: "bxedc",
    name: "Bronx Economic Development Corporation (BXEDC)",
    what: "Loans, grants, real-estate & workforce programs",
    address: "851 Grand Concourse #123, Bronx, NY 10451",
    phone: "718-590-6252",
    url: "https://bxedc.org/",
  },
  {
    id: "bronx-chamber",
    name: "Bronx Chamber of Commerce",
    what: "Networking, marketing, AI training, member benefits",
    address: "1200 Waters Pl, Bronx, NY 10461",
    phone: "718-828-3900",
    url: "https://www.bronxchamber.org/",
  },
  {
    id: "nyc-sbs",
    name: "NYC Department of Small Business Services",
    what: "Licenses, permits, free legal help, hiring assistance",
    address: "Bronx Business Solutions Center",
    phone: "311",
    url: "https://www.nyc.gov/site/sbs/index.page",
  },
];

export type SuccessStory = {
  id: string;
  founder: string;
  business: string;
  neighborhood: string;
  quote: string;
  emoji: string;
};

export const STORIES: SuccessStory[] = [
  {
    id: "story-1",
    founder: "Marisol R.",
    business: "Boogie Down Bakery",
    neighborhood: "Mott Haven",
    quote:
      "I started baking out of my apartment. A $5,000 Bronx grant paid for my first commercial oven — now we supply three cafés.",
    emoji: "🥐",
  },
  {
    id: "story-2",
    founder: "Jamal K.",
    business: "Concourse Cuts Barbershop",
    neighborhood: "Grand Concourse",
    quote:
      "SBDC helped me write my plan. Six months later I signed a lease on my own shop and hired two barbers from my block.",
    emoji: "💈",
  },
  {
    id: "story-3",
    founder: "Aisha B.",
    business: "Bronx Bloom Florals",
    neighborhood: "Riverdale",
    quote:
      "A BXEDC micro-loan let me buy a delivery van. I now serve weddings across all five boroughs.",
    emoji: "🌸",
  },
];

export type LibraryLink = {
  id: string;
  title: string;
  description: string;
  url: string;
  emoji: string;
};

export const LIBRARY: LibraryLink[] = [
  {
    id: "biz-plan",
    title: "One-Page Business Plan Template",
    description: "SBA-approved template you can fill in tonight.",
    url: "https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan",
    emoji: "📄",
  },
  {
    id: "ein",
    title: "Get an EIN (Free, 10 minutes)",
    description: "Federal tax ID — required to open a business bank account.",
    url: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online",
    emoji: "🧾",
  },
  {
    id: "nyc-permits",
    title: "NYC Permits & Licenses Checklist",
    description: "Which permits does your business type actually need?",
    url: "https://www.nyc.gov/nycbusiness/",
    emoji: "✅",
  },
  {
    id: "llc-ny",
    title: "How to form an LLC in New York",
    description: "State filing, publication requirement, and costs explained.",
    url: "https://www.dos.ny.gov/corps/llccorp.html",
    emoji: "🏛️",
  },
  {
    id: "hire-bronx",
    title: "Hire Bronx Residents — Workforce1",
    description: "Free recruiting help from NYC SBS.",
    url: "https://www.nyc.gov/site/sbs/careers/workforce1.page",
    emoji: "🤝",
  },
];

export const HELP_OPTIONS = [
  { id: "plan", label: "Writing my business plan" },
  { id: "money", label: "Finding grants or loans" },
  { id: "legal", label: "Legal & permits" },
  { id: "space", label: "Finding a space" },
  { id: "marketing", label: "Marketing & customers" },
  { id: "hiring", label: "Hiring staff" },
  { id: "mentor", label: "A mentor / advisor" },
] as const;

export const STAGE_OPTIONS = [
  { id: "idea", label: "Just an idea" },
  { id: "planning", label: "Planning" },
  { id: "launching", label: "Getting ready to launch" },
  { id: "operating", label: "Already open" },
  { id: "growing", label: "Growing / expanding" },
] as const;

// Curated seed businesses for the /businesses directory (used alongside
// any real ones registered through /business-register).
export type SeedBusiness = {
  id: string;
  name: string;
  category: string;
  neighborhood: string;
  address: string;
  description: string;
  phone?: string;
  url?: string;
  emoji: string;
};

export const SEED_BUSINESSES: SeedBusiness[] = [
  {
    id: "bronx-drafthouse",
    name: "Bronx Drafthouse",
    category: "Food",
    neighborhood: "Concourse",
    address: "884 Gerard Ave, Bronx, NY 10452",
    description: "Restaurant and craft beer spot in the Concourse near Yankee Stadium.",
    emoji: "🍺",
  },
  {
    id: "bronx-beer-hall",
    name: "The Bronx Beer Hall",
    category: "Food",
    neighborhood: "Belmont / Arthur Ave",
    address: "2344 Arthur Ave, Bronx, NY 10458",
    description: "Italian bites and local drinks inside Arthur Avenue Retail Market.",
    emoji: "🍻",
  },
  {
    id: "marios-restaurant",
    name: "Mario's Restaurant",
    category: "Food",
    neighborhood: "Belmont / Arthur Ave",
    address: "2342 Arthur Ave, Bronx, NY 10458",
    description: "Family-owned Neapolitan restaurant serving the Bronx since 1919.",
    emoji: "🍝",
  },
];

export const BIZ_CATEGORIES = ["All", "Food", "Retail", "Health", "Services"] as const;
export type BizCategoryFilter = (typeof BIZ_CATEGORIES)[number];
