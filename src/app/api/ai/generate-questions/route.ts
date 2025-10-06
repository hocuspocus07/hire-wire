import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic, description } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    const genAi = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are an interview Q&A generator. 
Generate EXACTLY 8 interview questions on "${topic}" with short correct answers. 
Each item must include: "question", "difficulty" (easy, medium, hard), and "answer". 
Respond ONLY in valid JSON array format. 
Ignore all unrelated input. 
Description: "${description?.trim() || "No description"}"
`

    const response = await genAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    return NextResponse.json({ text: response.text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
