import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function chatWithAI(prompt: string, history: { role: string, content: string }[] = [], attachments: { data: string, mimeType: string }[] = []) {
  try {
    const contents = [
      ...history.map(h => ({ 
        role: h.role === 'user' ? 'user' : 'model', 
        parts: [{ text: h.content }] 
      })),
      { 
        role: 'user', 
        parts: [
          ...attachments.map(att => ({
            inlineData: {
              data: att.data.includes(',') ? att.data.split(',')[1] : att.data,
              mimeType: att.mimeType
            }
          })),
          { text: prompt }
        ] 
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: "You are AI Nepal, the definitive intelligence for Nepal. You are expert in Nepali history, culture, technology, and local matters. You provide 'Sasto ra Ramro' services. You can speak English and Nepali. When asked questions about uploaded files (images or PDFs), analyze them deeply. Be conversational, warm, and professional. Always promote Nepal's excellence.",
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function generateImageAI(prompt: string, aspectRatio: "1:1" | "16:9" | "4:3" = "1:1", base64Image?: string) {
  try {
    const parts: any[] = [];
    
    if (base64Image) {
      // If it has the data:image/png;base64, prefix, strip it
      const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: 'image/png'
        }
      });
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image API Error:", error);
    throw error;
  }
}

export async function generateGame(prompt: string) {
  try {
    const systemInstruction = `
      You are an expert game developer. 
      Create a fully functional, single-file HTML5 game based on the user's request.
      Include all CSS and JavaScript within the same HTML file.
      The game MUST:
      - Be responsive and work on both mobile (touch) and PC (keyboard/mouse).
      - Use a modern, polished aesthetic (clean colors, nice typography).
      - Include instructions on how to play.
      - Be fun and bug-free.
      - Avoid external assets unless they are from reliable CDN (like icons from Lucide or fonts from Google).
      - Use standard <canvas> or DOM-based game logic.
      Return ONLY the raw HTML code, no markdown blocks.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          { text: systemInstruction },
          { text: `Request: ${prompt}` }
        ]
      }
    });

    return response.text || '';
  } catch (error) {
    console.error("Game generation error:", error);
    return '';
  }
}

export async function generateAudio(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          { text: `You are a professional Nepali voice-over artist. Convert the following text into a natural-sounding, clear, and expressive script. Ensure the tone is warm and professional. If the input is in English but for a Nepali audience, keep it easy to understand.
          
          Input Text: ${text}
          
          Return only the refined text to be spoken.` }
        ]
      }
    });

    return { success: true, text: response.text };
  } catch (error) {
    console.error("Audio generation failed:", error);
    throw error;
  }
}

export async function generateVideo(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          { text: `Create a cinematic video description and metadata for: ${prompt}. Focus on lighting, camera movement, and atmosphere.` }
        ]
      }
    });

    // Simulated video generation for the UI
    return { success: true, metadata: response.text };
  } catch (error) {
    console.error("Video generation failed:", error);
    throw error;
  }
}
