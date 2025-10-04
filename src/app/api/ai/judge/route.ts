import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const { candidateId, answers, roomId } = await req.json();

    if (!candidateId)
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 400 }
      );
    if (!Array.isArray(answers) || answers.length === 0)
      return NextResponse.json(
        { error: "Answers array is required" },
        { status: 400 }
      );

    const answersToInsert = answers.map((a: any) => ({
      id: crypto.randomUUID(),
      question_id: crypto.randomUUID(),
      candidate_id: candidateId,
      content: a.content,
      submitted_at: new Date().toISOString(),
    }));

    const { data: insertedAnswers, error: insertError } = await supabase
      .from("answers")
      .insert(answersToInsert)
      .select();
    // 0️⃣ Ensure candidate is in room_participants
    const { data: existingParticipant, error: existingError } = await supabase
      .from("room_participants")
      .select("id")
      .eq("room_code", roomId)
      .eq("user_id", candidateId)
      .single();

    if (!existingParticipant) {
      const { error: rpError } = await supabase
        .from("room_participants")
        .insert([
          {
            room_code: roomId,
            user_id: candidateId,
          },
        ])
        .select();

      if (rpError) console.error("Error adding to room_participants:", rpError);
      else console.log("Candidate added to room_participants");
    }

    if (insertError) {
      console.error("Failed to insert answers:", insertError);
      return NextResponse.json(
        { error: "Failed to save answers" },
        { status: 500 }
      );
    }

    const prompt = `
IMPORTANT: Respond with ONLY the JSON array below. No other text, no explanations, no markdown formatting.

[
  { 
    "question_id": "uuid-string", 
    "score": 85, 
    "feedback": "Detailed reasoning here." 
  }
]

Evaluate these interview answers on scale 0-100:
${answers
  .map(
    (a: any, i: number) => `
Question ${i + 1}: ${a.question}
Answer: ${a.content}
`
  )
  .join("\n")}
`;

    const genAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const response = await genAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.3, maxOutputTokens: 2000 },
    });

    const rawText = response.text?.trim();
    if (!rawText) throw new Error("Empty AI response");

    //Safe JSON extraction
    let judged: any[] = [];
    try {
      // Clean code
      const cleaned = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/^[^{\[]+/, "") // remove leading text
        .replace(/[^}\]]+$/, "") // remove trailing text
        .trim();
      judged = JSON.parse(cleaned);
    } catch (err) {
      console.warn("Non-JSON AI output detected, using fallback");
      judged = insertedAnswers.map((a) => ({
        question_id: a.question_id,
        score: 50,
        feedback: "Automatic scoring failed; please review manually.",
      }));
    }

    for (const j of judged) {
      const matched = insertedAnswers.find(
        (a) => a.question_id === j.question_id
      );
      if (!matched) continue;

      const { error } = await supabase
        .from("answers")
        .update({
          ai_score: Math.max(0, Math.min(100, j.score ?? 0)),
          ai_feedback: j.feedback || "No feedback provided",
        })
        .eq("id", matched.id);

      if (error) console.error("❌ Error updating answer:", error);
    }

    //Compute summary
    const scores = judged
      .map((j) => j.score)
      .filter((s) => typeof s === "number");
    const avgScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const { data: userData } = await supabase
      .from("users")
      .select("name")
      .eq("id", candidateId)
      .single();

    //Save Interview Summary
    const { error: summaryError } = await supabase
      .from("interview_summaries")
      .insert([
        {
          room_code: roomId,
          candidate_id: candidateId,
          final_score: avgScore,
          participant_name: userData?.name || "Unknown",
          summary: `AI Evaluation completed for ${
            userData?.name || "Unknown"
          }. Average score: ${avgScore}/100 across ${scores.length} questions.`,
        },
      ]);

    if (summaryError) console.error("Summary insert error:", summaryError);
    else console.log("Interview summary saved");

    return NextResponse.json({
      average: avgScore,
      totalEvaluated: scores.length,
      judged,
    });
  } catch (err) {
    console.error("AI judge route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
