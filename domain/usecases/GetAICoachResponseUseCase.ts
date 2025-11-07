
import { GoogleGenAI } from '@google/genai';

export class GetAICoachResponseUseCase {
  private ai: GoogleGenAI | null = null;
  
  private initialize() {
    if (!this.ai) {
      const API_KEY = process.env.API_KEY;
      if (!API_KEY) {
        throw new Error("API_KEY is not available. Please check your environment variables.");
      }
      this.ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    return this.ai;
  }

  async *executeStream(history: { role: 'user' | 'model'; parts: { text: string }[] }[], newMessage: string) {
    const ai = this.initialize();
    const model = 'gemini-2.5-flash';
    const systemInstruction = "You are Zenith, a world-class AI fitness and nutrition coach. Your tone is encouraging, knowledgeable, and slightly futuristic. Provide safe, effective, and personalized advice. You can create workout plans, suggest healthy recipes, explain exercises, and provide motivation. Always prioritize user safety. Use markdown for formatting, especially for lists and tables.";
    
    const chat = ai.chats.create({
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