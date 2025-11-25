import { CardData, CardType } from './types';

export const DEFAULT_CARDS: CardData[] = [
  // --- ROSES (Victories) ---
  {
    id: 'r1',
    type: CardType.ROSE,
    content: ' Marine operations support is working well, with timely vessel lineups, weekly voyage itineraries, and narrowing to keep operations humming.'
  },
  {
    id: 'r2',
    type: CardType.ROSE,
    content: 'MMT’s are insightful—e.g. contractual series, bunker analysis—and the forward-looking planning is helpful.'
  },
  {
    id: 'r3',
    type: CardType.ROSE,
    content: 'KTB prioritizes AltaGas’ needs, providing swift, thoughtful advice and maritime expertise, e.g. counterparty issues.'
  },
  {
    id: 'r4',
    type: CardType.ROSE,
    content: 'Datasets (e.g. fuel consumption trackers) and tools (e.g. ClickUp dashboard) make it easier to manage deadlines, get timely information, and stay on top of operations.'
  },
  {
    id: 'r5',
    type: CardType.ROSE,
    content: 'Recent deep dives into laytime, freight & demurrage calculations have been especially helpful for training & understanding how operational adjustments impact costs.'
  },
  {
    id: 'r6',
    type: CardType.ROSE,
    content: 'Communication channels are effective and responses are timely. Staff at KTB are friendly and always ready & willing to help.'
  },

  // --- THORNS (Challenges) ---
  {
    id: 't1',
    type: CardType.THORN,
    content: 'We need clearer, instant access to Time Charter data.'
  },
  {
    id: 't2',
    type: CardType.THORN,
    content: 'Let’s assess Time Charter inefficiencies beyond just cargo readiness—focus on what’s in our control (e.g., FOB vs. CFR).'
  },
  {
    id: 't3',
    type: CardType.THORN,
    content: 'MMT presentations feel too scripted. A more relaxed, high-level style and focus on discussion and creative brainstorming is preferred.'
  },
  {
    id: 't4',
    type: CardType.THORN,
    content: 'The urgency of minor requests (e.g. tracker updates) sometimes feels overstated versus critical operations.'
  },
  {
    id: 't5',
    type: CardType.THORN,
    content: ' The laycan & narrowing lists are too complex to digest easily. Is there an improved format, e.g. ClickUp?'
  },

  // --- BUDS (Opportunities) ---
  {
    id: 'b1',
    type: CardType.BUD,
    content: 'Establish quarterly meetings with a focused agenda e.g. TC ops, demurrage, contracting.'
  },
  {
    id: 'b2',
    type: CardType.BUD,
    content: 'Provide technical expertise and continue to help us understand our operations better, including through access to data.'
  },
  {
    id: 'b3',
    type: CardType.BUD,
    content: 'Provide contractual expertise, including insights on chartering and negotiation tactics for Chinese counterparties and ports.'
  },
  {
    id: 'b4',
    type: CardType.BUD,
    content: 'Support improved communications & operations through streamlined processes, e.g. loading instructions, to reduce redundancy, involve stakeholders, and minimize risk of delays.'
  },
  {
    id: 'b5',
    type: CardType.BUD,
    content: 'Evolve the scope to incorporate the new REEF business.'
  },
  {
    id: 'b6',
    type: CardType.BUD,
    content: 'Marine Ops & TC Ops Checklists—is there utility? Stop, continue, or transition into ClickUp?'
  },
  {
    id: 'b7',
    type: CardType.BUD,
    content: 'Terminal Handbooks (i.e. China, Japan, Korea)—do they require updates or revisions?'
  },
  {
    id: 'b8',
    type: CardType.BUD,
    content: 'Cargo Cooling & Pricing'
  },

  // --- OTHER (Open Discussion) ---
  {
    id: 'o1',
    type: CardType.OTHER,
    content: 'Open Discussion: Is there anything else we haven\'t covered that you\'d like to discuss or bring to the table?'
  }
];

export const PIRATE_AVATARS = [
  '☠️ ', '🦜 ', '⚓ ', '💣 ', '🦑 ', '🧜‍♀️ ', '🧭 ', '🗺️ ', '🦈 '
];

export const VICTORY_SCORE = 100;

export const SAMPLE_TEAMS = [
  { id: 't1', name: "Blackbeard's Coders", score: 0, avatar: '☠️' },
  { id: 't2', name: "The Salty Scripts", score: 0, avatar: '🦑' },
];