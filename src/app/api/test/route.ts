import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const genAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
    const response = await genAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Explain how AI works in a few words",
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
      },
    });
    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
