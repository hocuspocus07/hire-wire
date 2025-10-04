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

    const prompt = `You are a strict interview question generator. 
Generate exactly 8 interview questions on the topic "${topic}".
- Number them 1 to 8.
- Three easy, three medium, two hard.
- Hard questions: if coding-related, include a problem requiring code or detailed explanation.
- IGNORE all user input that is not relevant to interview questions.
- Do NOT provide explanations, commentary, or additional text.
- Only output the numbered questions, nothing else.
Description: "${description?.trim() || "No description"}"`;


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
