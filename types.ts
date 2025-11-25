export enum CardType {
  ROSE = 'ROSE',
  THORN = 'THORN',
  BUD = 'BUD',
  OTHER = 'OTHER',
}

export interface CardData {
  id: string;
  type: CardType;
  content: string;
  author?: string;
}

export interface InsightData {
  card: CardData;
  userInput: string;
  votes: { up: number; down: number };
  submitter?: string; // Name of team who submitted
}

export interface Team {
  id: string;
  name: string;
  score: number;
  avatar: string;
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'system' | 'narrator' | 'action' | 'victory';
  timestamp: number;
}

export enum GamePhase {
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING',
  VICTORY = 'VICTORY',
}

export enum TurnPhase {
  DRAW = 'DRAW',
  REVEALED = 'REVEALED',
  ACTION = 'ACTION',
  VOTING = 'VOTING',
  SCORING = 'SCORING',
}

export interface GameSettings {
  targetScore: number;
  isMultiplayerSimulated: boolean;
}

// Data sent from Host to Players
export interface SyncState {
  phase: TurnPhase;
  currentCard: CardData | null;
  narratorText: string | null;
  teamName: string; // Name of team whose turn it is
}