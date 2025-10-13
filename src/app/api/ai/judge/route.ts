import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenAI } from "@google/genai";

type IncomingAnswer = {
  questionId?: string; 
  questionText: string;
  difficulty?: string | null;
  content: string;
};

type EvaluatedAnswer = IncomingAnswer & {
  score: number | null;
  feedback: string;
};

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const { candidateId, roomCode, answers } = body as {
      candidateId?: string;
      roomCode?: string;
      answers?: IncomingAnswer[];
    };

    if (!candidateId) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 400 }
      );
    }
    if (!roomCode) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "A non-empty array of answers is required" },
        { status: 400 }
      );
    }

    const normalizedAnswers: IncomingAnswer[] = answers.map((a) => ({
      questionId: a.questionId,
      questionText: (a.questionText ?? "").trim(),
      difficulty: a.difficulty ?? null,
      content: (a.content ?? "").trim(),
    }));

    const evaluationPrompt = `
You are an expert AI technical interviewer. Evaluate the following interview answers on a scale of 0-100.
For each answer, return a JSON object with numeric "score" and concise "feedback".

Output ONLY a valid JSON array of objects and nothing else. Format must be:
[
  {"index": 0, "score": 85, "feedback": "Clear and accurate explanation of the concept."},
  {"index": 1, "score": 60, "feedback": "Partially correct; misses edge cases."},
  ...
]

Questions and candidate answers:
${normalizedAnswers
  .map(
    (a, i) =>
      `Question ${i + 1}${a.questionId ? ` (id:${a.questionId})` : ""}: ${
        a.questionText
      }\nAnswer: ${a.content}`
  )
  .join("\n\n---\n\n")}
`.trim();

    const genAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const evalResponse = await genAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: evaluationPrompt,
      config: { temperature: 0.2, maxOutputTokens: 3000 },
    });

    const rawEvalText = evalResponse?.text;
    if (!rawEvalText || typeof rawEvalText !== "string") {
      console.error("Empty AI evaluation response.");
      return NextResponse.json(
        { error: "Failed to get evaluation from AI." },
        { status: 500 }
      );
    }

    let evaluations: { index: number; score: number; feedback: string }[] = [];
    try {
      const jsonMatch = rawEvalText.match(/\[[\s\S]*\]/)?.[0];
      if (!jsonMatch) {
        throw new Error("No JSON array found in AI response");
      }
      const parsed = JSON.parse(jsonMatch);
      if (!Array.isArray(parsed))
        throw new Error("Parsed evaluation is not an array");
      evaluations = parsed.map((p) => ({
        index: Number(p.index),
        score: Number.isFinite(p.score) ? Number(p.score) : 0,
        feedback:
          typeof p.feedback === "string"
            ? p.feedback
            : String(p.feedback ?? ""),
      }));
    } catch (err) {
      console.error("Error parsing AI evaluation JSON:", err);
      console.error("Raw AI evaluation text:", rawEvalText);
      return NextResponse.json(
        { error: "Failed to parse AI evaluation." },
        { status: 500 }
      );
    }

    const evaluatedAnswers: EvaluatedAnswer[] = normalizedAnswers.map(
      (ans, idx) => {
        const ev = evaluations.find((e) => e.index === idx);
        return {
          ...ans,
          score: ev ? Math.max(0, Math.min(100, Math.round(ev.score))) : null,
          feedback: ev
            ? ev.feedback || "No feedback provided."
            : "No evaluation available.",
        };
      }
    );

    const numericScores = evaluatedAnswers
      .map((a) => a.score)
      .filter((s): s is number => typeof s === "number");
    const averageScore = numericScores.length
      ? Math.round(
          numericScores.reduce((x, y) => x + y, 0) / numericScores.length
        )
      : 0;

    const summaryPrompt = `
You are an expert hiring manager. Provide a concise, one-paragraph summary of the candidate's interview performance.
Comment on overall knowledge, clarity, strengths and weaknesses. Output only the paragraph text (no JSON).

Context:
${evaluatedAnswers
  .map(
    (a, i) =>
      `Question ${i + 1}: ${a.questionText}\nCandidate Answer: ${
        a.content
      }\nEvaluation: Score ${a.score ?? "N/A"}/100 - ${a.feedback}`
  )
  .join("\n\n")}
`.trim();

    const summaryResponse = await genAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: summaryPrompt,
      config: { temperature: 0.2, maxOutputTokens: 450 },
    });

    const summaryText =
      summaryResponse && summaryResponse.text
        ? summaryResponse.text.trim()
        : `AI evaluation completed. Average score: ${averageScore}/100.`;

    try {
      const { data: existingParticipant } = await supabase
        .from("room_participants")
        .select("id")
        .eq("room_code", roomCode)
        .eq("user_id", candidateId)
        .single();

      if (!existingParticipant) {
        const { error: rpError } = await supabase
          .from("room_participants")
          .insert([
            {
              room_code: roomCode,
              user_id: candidateId,
            },
          ]);
        if (rpError)
          console.error("Error adding to room_participants:", rpError);
      }
    } catch (e) {
      console.error("room_participants check/insert failed:", e);
    }

    const insertPayload = {
      room_code: roomCode,
      candidate_id: candidateId,
      answers: evaluatedAnswers, // stored as JSONB
      overall_score: averageScore,
      overall_feedback: summaryText,
      created_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from("interview_attempts")
      .insert(insertPayload);
    if (insertError) {
      console.error("Failed to insert interview_attempts row:", insertError);
      return NextResponse.json(
        { error: "Failed to save interview attempt." },
        { status: 500 }
      );
    }

    try {
      const { data: userData } = await supabase
        .from("users")
        .select("name")
        .eq("id", candidateId)
        .single();

      const participantName = userData?.name || "Unknown";

      const { error: summaryError } = await supabase
        .from("interview_summaries")
        .insert([
          {
            room_code: roomCode,
            candidate_id: candidateId,
            final_score: averageScore,
            participant_name: participantName,
            summary: summaryText,
            created_at: new Date().toISOString(),
          },
        ]);

      if (summaryError)
        console.error("Failed to insert interview_summary row:", summaryError);
    } catch (e) {
      console.error("Unexpected error saving interview_summary:", e);
    }
    return NextResponse.json({
      average: averageScore,
      summary: summaryText,
      evaluations: evaluatedAnswers,
    });
  } catch (err: any) {
    console.error("AI judge route unexpected error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
