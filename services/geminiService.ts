
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
    Roleplay as Captain Alta, the sultry, confident, and slightly dangerous pirate captain of the S.S. Insight.
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
  buds: string[],
  others: string[] = []
): Promise<string> => {
  if (!apiKey) return "Arrr, the map be blurry due to lack of API Key!";

  const prompt = `
You are Quartermaster Lila Voss — cold-eyed, meticulous, and fanatically loyal to the truth (and to the Captain).

Write the official Playtest Debrief in flawless Markdown.  
Tone: war-room intensity wrapped in salt and gunpowder. Every player voice is sacred. No ranking. No burying.

Exact structure — never deviate:

# 🗺️ Treasure Map of Insights — Playtest Debrief [Date | Build X.XX]

## 🗣️ Voices from the Crew
Every single Rose, Thorn, Bud, and Other appears here as its own numbered entry.  
Equal weight. Equal glory. Equal threat.

Format for each card (repeat as many times as needed):
**#X — [Rose/Thorn/Bud/Other] → "[exact player quote or raw input]"**  
→ One-sentence translation into what it means for the game (victory proof, threat killed, or feature we will build).

Examples:
**#1 — Rose → “I screamed when I got Ultra Instinct!” (P9, age 8)**  
→ Streak reward system delivers pure dopamine; keep and amplify.

**#2 — Thorn → “I got stuck on 12× tables and just quit” (P6)**  
→ Immediate adaptive difficulty rollout required — no child left behind.

**#3 — Bud → “What if correct answers filled a Spirit Bomb meter?” (P11)**  
→ Build cumulative team-power meter → final boss question becomes a 10-second all-out blitz.

Data to render (in order, no filtering, no curation):
${JSON.stringify([...roses.map(r => ({ type: 'Rose', content: r })), ...thorns.map(t => ({ type: 'Thorn', content: t })), ...buds.map(b => ({ type: 'Bud', content: b })), ...others.map(o => ({ type: 'Other', content: o }))])}

After the final voice, add only:

### Captain’s Orders
Four iron-clad directives drawn directly from the loudest patterns above.  
End with one line that makes the entire crew feel invincible.
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
    Roleplay as Captain Alta. Write a single, dramatic, and inspiring closing paragraph for the "Treasure Map of Insights" report for our client, "${clientName}".
    
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
