export type Market = "San Diego" | "Palm Springs" | "Laguna Beach" | "Los Angeles";

export type Placement =
  | "Premium annual + interior full page"
  | "Full-page bleed"
  | "Full-page non-bleed"
  | "Half-page non-bleed"
  | "Quarter-page non-bleed";

export type Stage =
  | "Prospecting"
  | "Discovery"
  | "Proposal"
  | "Closing"
  | "Closed Won"
  | "Closed Lost";

export type Opportunity = {
  id: string;
  company: string;
  contact: string;
  role: string;
  market: Market;
  placement: Placement;
  annualPrice: number;
  stage: Stage;
  probability: number;
  expectedClose: string;
  lastInteraction: string;
  barrier: string;
  nextAction: string;
  owner: "Charley";
};

export type Activity = {
  id: string;
  account: string;
  type: "Call" | "Email" | "Meeting" | "Follow-up" | "Note";
  detail: string;
  time: string;
  owner: "Charley" | "LaShea";
};

export const markets: Market[] = ["San Diego", "Palm Springs", "Laguna Beach", "Los Angeles"];

export const stages: Stage[] = ["Prospecting", "Discovery", "Proposal", "Closing", "Closed Won"];

export const pricing: Array<{
  name: Placement;
  price: number;
  comparison: string;
  guidance: string;
}> = [
  {
    name: "Premium annual + interior full page",
    price: 7500,
    comparison: "+50% vs. full-page bleed",
    guidance: "Lead with the complete annual visibility package and interior full-page presence.",
  },
  {
    name: "Full-page bleed",
    price: 5000,
    comparison: "Base full-page price",
    guidance: "Best for businesses that want maximum visual impact to the edge of the printed page.",
  },
  {
    name: "Full-page non-bleed",
    price: 4500,
    comparison: "10% below full-page bleed",
    guidance: "A full-page presence with a contained border and a $500 savings.",
  },
  {
    name: "Half-page non-bleed",
    price: 2500,
    comparison: "50% below full-page bleed",
    guidance: "A strong entry point for established local businesses testing annual print visibility.",
  },
  {
    name: "Quarter-page non-bleed",
    price: 1500,
    comparison: "70% below full-page bleed",
    guidance: "The accessible annual option when budget is the main barrier.",
  },
];

export const demoOpportunities: Opportunity[] = [
  {
    id: "opp-01",
    company: "Pacific Coast Hospitality",
    contact: "Jordan Ellis",
    role: "Marketing Director",
    market: "San Diego",
    placement: "Premium annual + interior full page",
    annualPrice: 7500,
    stage: "Closing",
    probability: 88,
    expectedClose: "Sep 18",
    lastInteraction: "Today · 9:15 AM",
    barrier: "Needs confirmation that category exclusivity applies.",
    nextAction: "Call Jordan with the premium-placement hold and exclusivity language.",
    owner: "Charley",
  },
  {
    id: "opp-02",
    company: "Desert Bloom Resort",
    contact: "Maya Chen",
    role: "General Manager",
    market: "Palm Springs",
    placement: "Full-page bleed",
    annualPrice: 5000,
    stage: "Proposal",
    probability: 72,
    expectedClose: "Sep 20",
    lastInteraction: "Yesterday · 4:30 PM",
    barrier: "Comparing the bleed page with a lower-cost non-bleed option.",
    nextAction: "Review the $5,000 bleed and $4,500 non-bleed value difference.",
    owner: "Charley",
  },
  {
    id: "opp-03",
    company: "Laguna Arts Collective",
    contact: "Renee Alvarez",
    role: "Executive Director",
    market: "Laguna Beach",
    placement: "Full-page non-bleed",
    annualPrice: 4500,
    stage: "Proposal",
    probability: 65,
    expectedClose: "Sep 22",
    lastInteraction: "Sep 14 · 1:05 PM",
    barrier: "Board approval is scheduled for Friday.",
    nextAction: "Send a one-page board-ready value summary before Thursday noon.",
    owner: "Charley",
  },
  {
    id: "opp-04",
    company: "Westside Wellness Studio",
    contact: "Avery Brooks",
    role: "Founder",
    market: "Los Angeles",
    placement: "Half-page non-bleed",
    annualPrice: 2500,
    stage: "Discovery",
    probability: 45,
    expectedClose: "Sep 27",
    lastInteraction: "Sep 13 · 11:40 AM",
    barrier: "Still clarifying the audience fit for the Los Angeles edition.",
    nextAction: "Share the visitor profile and confirm the target customer overlap.",
    owner: "Charley",
  },
  {
    id: "opp-05",
    company: "North Park Social",
    contact: "Alex Rivera",
    role: "Owner",
    market: "San Diego",
    placement: "Half-page non-bleed",
    annualPrice: 2500,
    stage: "Closing",
    probability: 80,
    expectedClose: "Sep 19",
    lastInteraction: "Today · 8:35 AM",
    barrier: "Wants a final confirmation of payment timing.",
    nextAction: "Confirm annual price and ask for the signed placement authorization.",
    owner: "Charley",
  },
  {
    id: "opp-06",
    company: "Canyon Kitchen",
    contact: "Sam Patel",
    role: "Managing Partner",
    market: "Palm Springs",
    placement: "Quarter-page non-bleed",
    annualPrice: 1500,
    stage: "Closed Won",
    probability: 100,
    expectedClose: "Sep 12",
    lastInteraction: "Sep 12 · 3:20 PM",
    barrier: "None — placement authorization received.",
    nextAction: "Collect artwork and confirm production specifications.",
    owner: "Charley",
  },
  {
    id: "opp-07",
    company: "Coastline Gallery",
    contact: "Taylor Morgan",
    role: "Gallery Director",
    market: "Laguna Beach",
    placement: "Full-page bleed",
    annualPrice: 5000,
    stage: "Discovery",
    probability: 50,
    expectedClose: "Sep 28",
    lastInteraction: "Sep 12 · 10:10 AM",
    barrier: "Needs examples of how the annual placement supports visitor discovery.",
    nextAction: "Use the Laguna Beach audience story in the next discovery conversation.",
    owner: "Charley",
  },
  {
    id: "opp-08",
    company: "Silver Lake Social Club",
    contact: "Chris Monroe",
    role: "Operations Director",
    market: "Los Angeles",
    placement: "Premium annual + interior full page",
    annualPrice: 7500,
    stage: "Closed Won",
    probability: 100,
    expectedClose: "Sep 11",
    lastInteraction: "Sep 11 · 2:45 PM",
    barrier: "None — agreement received.",
    nextAction: "Schedule creative intake and artwork deadline review.",
    owner: "Charley",
  },
];

export const initialActivities: Activity[] = [
  {
    id: "act-01",
    account: "Pacific Coast Hospitality",
    type: "Call",
    detail: "Confirmed decision-maker and surfaced exclusivity question.",
    time: "Today · 9:15 AM",
    owner: "Charley",
  },
  {
    id: "act-02",
    account: "North Park Social",
    type: "Email",
    detail: "Sent payment-timing summary and placement authorization.",
    time: "Today · 8:35 AM",
    owner: "Charley",
  },
  {
    id: "act-03",
    account: "Desert Bloom Resort",
    type: "Meeting",
    detail: "Compared bleed and non-bleed annual placement options.",
    time: "Yesterday · 4:30 PM",
    owner: "Charley",
  },
  {
    id: "act-04",
    account: "Laguna Arts Collective",
    type: "Note",
    detail: "LaShea prepared a board-ready annual value summary.",
    time: "Yesterday · 2:10 PM",
    owner: "LaShea",
  },
];

export const marketSignals: Record<Market, Array<{name: string; signal: string; score: number}>> = {
  "San Diego": [
    {name: "Hillcrest", signal: "High visitor density · hospitality cluster", score: 92},
    {name: "North Park", signal: "Strong dining and nightlife fit", score: 86},
    {name: "Liberty Station", signal: "Events and cultural destination", score: 78},
  ],
  "Palm Springs": [
    {name: "Downtown", signal: "Resort and dining concentration", score: 89},
    {name: "Uptown Design District", signal: "Retail and design audience", score: 82},
    {name: "Tahquitz River Estates", signal: "Hospitality opportunity", score: 71},
  ],
  "Laguna Beach": [
    {name: "Downtown / Main Beach", signal: "Visitor and gallery foot traffic", score: 91},
    {name: "HIP District", signal: "Dining, art, and boutique cluster", score: 84},
    {name: "North Laguna", signal: "Affluent visitor audience", score: 73},
  ],
  "Los Angeles": [
    {name: "West Hollywood", signal: "Hospitality and nightlife fit", score: 93},
    {name: "Silver Lake", signal: "Independent retail and dining", score: 85},
    {name: "Los Feliz", signal: "Neighborhood discovery audience", score: 76},
  ],
};
