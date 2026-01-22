
import { GoogleGenAI, Type } from "@google/genai";
import { RideConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getRideItinerary = async (config: RideConfig) => {
  const prompt = `Generate a detailed itinerary for a motorcycle ride on ${config.date} starting at ${config.takeOffTime}. 
  Bikes: ${config.bikes.join(', ')}.
  Route Go: ${config.routeGo.join(' -> ')}.
  Route Back: ${config.routeBack.join(' -> ')}.
  Provide estimated arrival times, distances between stops (rough KM), and specific advice for Honda RS150 and Yamaha Y16 riders on these routes.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          itinerary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                location: { type: Type.STRING },
                time: { type: Type.STRING },
                distanceFromStart: { type: Type.NUMBER },
                notes: { type: Type.STRING }
              },
              required: ["location", "time", "distanceFromStart", "notes"]
            }
          },
          safetyAdvice: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          bikeMaintenance: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["itinerary", "safetyAdvice", "bikeMaintenance"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return null;
  }
};
