
import { GoogleGenAI, Modality } from "@google/genai";
import { CardType } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a pirate narrator audio reaction to a card.
 */
export const generatePirateReaction = async (cardType: CardType, content: string): Promise<ArrayBuffer | null> => {
  if (!apiKey) return null;

  // "Kore" is often a good option for a female voice in GenAI configs.
  const prompt = `
    Roleplay as Captain Morgana, the sultry, confident, and slightly dangerous pirate captain of the S.S. Insight.
    You are addressing your crew in a game of "Rose, Bud, Thorn".
    
    The current card is a ${cardType}.
    The card content is: "${content}".
    
    Guidelines:
    - Tone: Husky, teasing, authoritative, pirate slang.
    - For Rose: Purr with delight. "Ah, smooth sailing..."
    - For Thorn: Be sharp and commanding. "A kraken approaches!"
    - For Bud: Be greedy and excited. "I smell gold..."
    - Keep it under 15 words. Punchy and dramatic.
    - Just the spoken text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64ToArrayBuffer(base64Audio);
    }
    return null;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};

/**
 * Generates a summary "Treasure Map" text from the collected insights.
 */
export const generateTreasureMapSummary = async (
  roses: string[],
  thorns: string[],
  buds: string[]
): Promise<string> => {
  if (!apiKey) return "Arrr, the map be blurry due to lack of API Key!";

  const prompt = `
    You are the Ship's Quartermaster. Compile the official logbook for the S.S. Insight's latest voyage.
    Output in valid Markdown.
    
    Use these headings:
    # 🗺️ The Treasure Map of Insights
    ## 🌹 Smooth Seas (Victories)
    ## ⚔️ Krakens Defeated (Challenges & Fixes)
    ## 💎 Buried Treasure (New Ideas)
    
    Data:
    Roses: ${JSON.stringify(roses)}
    Thorns (with fixes): ${JSON.stringify(thorns)}
    Buds (with ideas): ${JSON.stringify(buds)}
    
    Style: Pirate-themed but professional enough for a business summary. 
    End with a motivating "Captain's Orders" for the next sprint.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "The map is blank!";
  } catch (error: any) {
    console.error("Gemini Text Gen Error:", error);
    return `Could not generate map. Error: ${error.message || error}`;
  }
};

/**
 * Generates a "Captain's Orders" closing paragraph.
 */
export const generateCaptainsOrders = async (
  clientName: string,
  winningTeam: string,
  topBud: string
): Promise<string> => {
  if (!apiKey) return "Captain's Orders: Sail forth and conquer! (API Key missing)";

  const prompt = `
    Roleplay as Captain Morgana. Write a single, dramatic, and inspiring closing paragraph for the "Treasure Map of Insights" report for our client, "${clientName}".
    
    Context:
    - The winning crew is "${winningTeam}".
    - The top idea (Bud) discovered was "${topBud}".
    
    Guidelines:
    - Tone: Sultry, authoritative, pirate-themed but professional enough for a business report.
    - Congratulate the winning crew by name.
    - Mention the top idea as the "course we must chart".
    - End with a call to action for the next voyage.
    - Max 80 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "Sail forth!";
  } catch (error) {
    console.error("Gemini Orders Error:", error);
    return "Captain's Orders: The winds are favorable. Take these insights and chart a course for success! The S.S. Insight awaits your return.";
  }
};

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
