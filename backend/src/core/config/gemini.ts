import { GoogleGenAI } from "@google/genai";

import { env } from "./env.js";
import ApiError from "../../shared/utils/ApiError.js";

let aiInstance: GoogleGenAI | null = null;

export const getGeminiClient = (): GoogleGenAI => {
  if (!aiInstance) {
    if (!env.GEMINI_API_KEY) {
      throw new ApiError(500, "GEMINI_API_KEY is not configured in environment variables");
    }

    aiInstance = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });
  }

  return aiInstance;
};
