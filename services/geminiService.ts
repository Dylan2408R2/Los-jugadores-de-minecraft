import { GoogleGenAI, Chat } from "@google/genai";

let aiChatSession: Chat | null = null;
let aiClient: GoogleGenAI | null = null;

// Safely retrieve API Key without crashing in browser environments where 'process' is undefined
const getApiKey = (): string => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }
  return '';
};

// Initialize the personal AI assistant
export const initializeAIChat = (username: string) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.warn("Gemini API Key missing. AI features disabled.");
    return;
  }

  try {
    // Lazy initialization: Only create client when needed and key exists
    if (!aiClient) {
      aiClient = new GoogleGenAI({ apiKey });
    }

    aiChatSession = aiClient.chats.create({
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
    aiChatSession = null;
  }
};

// Stream messages for the personal AI assistant window
export const sendToAI = async function* (message: string): AsyncGenerator<string, void, unknown> {
  if (!aiChatSession) {
    const apiKey = getApiKey();
    if (!apiKey) {
      yield "⚠️ La IA está desactivada porque no se detectó una API Key en la configuración.";
    } else {
      yield "Error: No se pudo conectar con el asistente.";
    }
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