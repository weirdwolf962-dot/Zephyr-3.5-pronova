
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: AspectRatio;
  timestamp: number;
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
  currentImage: string | null;
  history: GeneratedImage[];
}
