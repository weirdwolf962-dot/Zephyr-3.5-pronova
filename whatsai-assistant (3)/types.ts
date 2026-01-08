
export enum PersonalityType {
  PROFESSIONAL = 'Professional',
  CASUAL = 'Casual',
  WITTY = 'Witty',
  CONCISE = 'Concise',
  FRIENDLY = 'Friendly',
  CUSTOM = 'Custom'
}

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them' | 'bot';
  timestamp: Date;
  status?: 'sent' | 'received' | 'thinking';
}

export interface Personality {
  type: PersonalityType;
  description: string;
  customInstructions?: string;
  exampleStyle?: string;
}

export interface AnalysisResult {
  tone: string;
  frequentlyUsedPhrases: string[];
  systemInstruction: string;
}

export interface BotStatus {
  isActive: boolean;
  connected: boolean;
  repliesSent: number;
  lastActive: Date | null;
}
