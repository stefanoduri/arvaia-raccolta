
import { GoogleGenAI } from "@google/genai";
import { HarvestData } from "../types";

// Fixed the input type from AgriData to HarvestData as defined in types.ts
export const getInsights = async (data: HarvestData[]): Promise<string> => {
  if (data.length === 0) return "Nessun dato disponibile per l'analisi.";

  // Initializing GoogleGenAI with the required named parameter and using process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Create a summary for AI context using existing HarvestData properties (pesoKg instead of pesoTotale)
  const summary = data.slice(0, 50).map(d => 
    `${d.data}: ${d.prodotto} - Peso: ${d.pesoKg}kg (Settimana: ${d.settimana}, Temp Media: ${d.tempMedia}°C)`
  ).join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analizza questi dati di distribuzione agricola e fornisci un breve riassunto (massimo 3 punti) sui trend principali, anomalie o suggerimenti. 
    Rispondi in italiano.
    Dati:
    ${summary}`,
    config: {
      temperature: 0.7,
      topP: 0.9,
    }
  });

  // response.text is a getter property, not a method
  return response.text || "Impossibile generare approfondimenti al momento.";
};
