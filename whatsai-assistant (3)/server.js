
import express from 'express';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

/**
 * INITIALIZATION
 * Following @google/genai guidelines
 */
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Bot Configuration
const botConfig = {
  autoReply: true,
  replyDelay: 2500, // Slight delay to seem more human
  activePersonality: {
    type: 'Casual',
    description: 'Relaxed, friendly, uses some emojis, lowercase often.',
  },
  maxHistoryLength: 15,
};

const conversationHistory = new Map();

/**
 * GENERATE AI REPLY
 * Updated to use Gemini 3 Flash and correct property extraction
 */
async function generateAiReply(history, personality) {
  const ai = getAI();
  try {
    const context = history
      .map(m => `${m.sender === 'them' ? 'Contact' : 'Me'}: ${m.text}`)
      .join('\n');
    
    const systemInstruction = `
      You are an AI replying on WhatsApp for a human user.
      Style: ${personality.type}
      Rules: ${personality.description}
      ${personality.customInstructions || ''}

      MANDATORY:
      - Reply ONLY with the message content.
      - Be extremely concise.
      - Match the linguistic vibe of the conversation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `CHAT CONTEXT:\n${context}\n\nREPLY NOW:`,
      config: {
        systemInstruction,
        temperature: 0.85
      }
    });

    // Property extraction as per latest SDK
    return response.text?.trim() || "Talk to you in a bit!";
  } catch (error) {
    console.error('Gemini error:', error);
    throw error;
  }
}

// Initialize WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('SCAN QR CODE TO CONNECT WHATSAPP:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsAi is LIVE on WhatsApp.');
});

client.on('message', async (message) => {
  if (!botConfig.autoReply || message.fromMe) return;
  if (message.from.endsWith('@g.us')) return; // Simple skip for groups

  const chatId = message.from;
  
  if (!conversationHistory.has(chatId)) conversationHistory.set(chatId, []);
  const history = conversationHistory.get(chatId);
  
  history.push({ text: message.body, sender: 'them' });
  if (history.length > botConfig.maxHistoryLength) history.shift();

  try {
    const chat = await message.getChat();
    await chat.sendStateTyping();

    // Human delay
    await new Promise(r => setTimeout(r, botConfig.replyDelay));

    const reply = await generateAiReply(history, botConfig.activePersonality);
    
    await message.reply(reply);
    history.push({ text: reply, sender: 'me' });
    
    console.log(`[REPLY SENT] To: ${chatId} | Msg: "${reply}"`);
  } catch (e) {
    console.error('Failed to reply:', e);
  }
});

client.initialize();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Dashboard backend running on port ${PORT}`));
