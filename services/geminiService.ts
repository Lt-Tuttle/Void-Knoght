import { GoogleGenAI } from "@google/genai";

// Initialize the API client safely
const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is not set. Lore generation will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateLore = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "The inscription is faded beyond recognition... (Missing API Key)";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an ancient historian of a fallen bug kingdom, similar to the style of Hollow Knight. Your tone is melancholic, cryptic, and legendary.",
      }
    });
    
    return response.text || "...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The ancient letters shift and blur, refusing to be read.";
  }
};