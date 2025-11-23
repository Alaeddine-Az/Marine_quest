import { CardData, CardType } from './types';

export const DEFAULT_CARDS: CardData[] = [
  // --- ROSES (Victories) ---
  {
    id: 'r1',
    type: CardType.ROSE,
    content: 'Trigon laytime calculations have been precise and reliable.'
  },
  {
    id: 'r2',
    type: CardType.ROSE,
    content: 'Excellent management of the vessel lineup at TPT (e.g., handling Holiday distribution).'
  },
  {
    id: 'r3',
    type: CardType.ROSE,
    content: 'Swift, thoughtful advice on ad-hoc counterparty issues.'
  },
  {
    id: 'r4',
    type: CardType.ROSE,
    content: 'The weekly voyage itineraries are detailed and highly valued.'
  },
  {
    id: 'r5',
    type: CardType.ROSE,
    content: 'Fuel consumption and expiry trackers are streamlining our operations.'
  },
  {
    id: 'r6',
    type: CardType.ROSE,
    content: 'The new ClickUp dashboard makes tracking narrowing due dates seamless.'
  },
  {
    id: 'r7',
    type: CardType.ROSE,
    content: 'Service is timely; we truly feel like a priority partner.'
  },
  {
    id: 'r8',
    type: CardType.ROSE,
    content: 'The deep-dive into freight and demurrage calculations was incredibly insightful.'
  },

  // --- THORNS (Challenges) ---
  {
    id: 't1',
    type: CardType.THORN,
    content: 'We need clearer, instant access to Time Charter data (datasets).'
  },
  {
    id: 't2',
    type: CardType.THORN,
    content: 'Assess Time Charter inefficiencies beyond just cargo readiness (e.g., FOB vs. CFR).'
  },
  {
    id: 't3',
    type: CardType.THORN,
    content: 'MMT presentations feel too scripted. We need a more relaxed, high-level style.'
  },
  {
    id: 't4',
    type: CardType.THORN,
    content: 'Urgency on minor requests (like tracker updates) sometimes feels overstated versus critical ops.'
  },
  {
    id: 't5',
    type: CardType.THORN,
    content: 'MMTs lack collaboration; let’s move from scripts to Socratic brainstorming.'
  },
  {
    id: 't6',
    type: CardType.THORN,
    content: 'The laycan & narrowing lists are too complex to digest easily.'
  },

  // --- BUDS (Opportunities) ---
  {
    id: 'b1',
    type: CardType.BUD,
    content: 'Establish quarterly focus meetings on TC ops, demurrage, and contracting.'
  },
  {
    id: 'b2',
    type: CardType.BUD,
    content: 'Develop an automated freight & demurrage calculator tool.'
  },
  {
    id: 'b3',
    type: CardType.BUD,
    content: 'Provide insights on chartering and negotiation tactics for Chinese ports.'
  },
  {
    id: 'b4',
    type: CardType.BUD,
    content: 'Streamline loading instructions to reduce redundancy and avoid delays.'
  },
  {
    id: 'b5',
    type: CardType.BUD,
    content: 'Evolve the scope to incorporate the new REEF business.'
  },
  {
    id: 'b6',
    type: CardType.BUD,
    content: 'Proactively push us to use valuable tools we might be ignoring.'
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