
import { GoogleGenAI, Type } from "@google/genai";
import { Personality, Message, AnalysisResult } from "../types";

// Initialize using the correct pattern
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateAiReply = async (
  history: Message[],
  personality: Personality
): Promise<string> => {
  const ai = getAI();
  
  // Format history for context
  const context = history
    .slice(-15) // Last 15 messages for context
    .map(m => `${m.sender === 'me' ? 'User' : 'Contact'}: ${m.text}`)
    .join('\n');
  
  const systemInstruction = `
    You are "WhatsAi", a private WhatsApp assistant.
    Personality Style: ${personality.type}
    Guidelines: ${personality.description}
    ${personality.customInstructions ? `Special Persona Info: ${personality.customInstructions}` : ''}
    
    CORE OPERATIONAL RULES:
    - You are replying directly on WhatsApp on behalf of the user.
    - Be brief and conversational (1-2 sentences usually).
    - Match the user's punctuation and emoji habits.
    - NEVER break character or mention you are an AI.
    - Provide ONLY the text of the reply.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `CONTEXT HISTORY:\n${context}\n\nREPLY AS ME TO THE LAST MESSAGE:`,
      config: {
        systemInstruction,
        temperature: 0.9, // Higher temperature for more human-like variety
        topP: 0.9,
      }
    });

    // Property-based text extraction as per guidelines
    return response.text || "Just saw this, will get back to you soon!";
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return "Error: Could not generate reply.";
  }
};

export const analyzeStyle = async (sampleText: string): Promise<AnalysisResult> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Examine these messages and define the persona: "${sampleText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tone: { type: Type.STRING, description: "Adjectives describing the vibe" },
            frequentlyUsedPhrases: { type: Type.ARRAY, items: { type: Type.STRING } },
            systemInstruction: { type: Type.STRING, description: "Directives for mimicking this specific voice" }
          },
          required: ["tone", "frequentlyUsedPhrases", "systemInstruction"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Style Analysis Error:", error);
    throw error;
  }
};
