import { GoogleGenAI, Chat } from "@google/genai";

let aiChatSession: Chat | null = null;

const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Initialize the personal AI assistant
export const initializeAIChat = (username: string) => {
  try {
    aiChatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `Eres un asistente de IA personal, útil y amigable para el usuario "${username}". 
        Tu objetivo es ayudar con dudas generales, dar consejos o simplemente charlar. 
        Mantén tus respuestas breves y útiles.`,
        temperature: 0.7,
      },
    });

  } catch (error) {
    console.error("Error initializing AI Chat:", error);
  }
};

// Stream messages for the personal AI assistant window
export const sendToAI = async function* (message: string): AsyncGenerator<string, void, unknown> {
  if (!aiChatSession) {
    yield "Error: Asistente no inicializado.";
    return;
  }

  try {
    const result = await aiChatSession.sendMessageStream({ message });
    
    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    yield "Lo siento, tengo problemas de conexión en este momento.";
  }
};