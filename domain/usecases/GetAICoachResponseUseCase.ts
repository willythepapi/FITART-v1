
import { GoogleGenAI } from '@google/genai';

// Assume process.env.API_KEY is available
const API_KEY = process.env.API_KEY;

export class GetAICoachResponseUseCase {
  private ai: GoogleGenAI;
  
  constructor() {
    if (!API_KEY) {
      throw new Error("API_KEY is not available. Please check your environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async *executeStream(history: { role: 'user' | 'model'; parts: { text: string }[] }[], newMessage: string) {
    const model = 'gemini-2.5-flash';
    const systemInstruction = "You are Zenith, a world-class AI fitness and nutrition coach. Your tone is encouraging, knowledgeable, and slightly futuristic. Provide safe, effective, and personalized advice. You can create workout plans, suggest healthy recipes, explain exercises, and provide motivation. Always prioritize user safety. Use markdown for formatting, especially for lists and tables.";
    
    const chat = this.ai.chats.create({
        model: model,
        config: { systemInstruction },
        history: history,
    });
    
    const result = await chat.sendMessageStream({ message: newMessage });

    for await (const chunk of result) {
      yield chunk.text;
    }
  }
}