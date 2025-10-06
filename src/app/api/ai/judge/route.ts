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
      if (!roomId)
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );

    const answersToInsert = answers.map((a: any, i: number) => ({
      id: crypto.randomUUID(),
      question_index: i,
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
You are an expert AI technical interviewer. Evaluate the following answers on a scale of 0-100. Provide a score and concise, constructive feedback for EACH answer.
Output ONLY a valid JSON array of objects, with no markdown, commentary, or extra text.

The JSON format MUST be:
[
  {"index": 0, "score": 85, "feedback": "Clear and accurate explanation of the concept."},
  {"index": 1, "score": 60, "feedback": "The answer is partially correct but misses key details about execution context."},
  ...
]

Here are the questions and answers:
${answers
  .map(
    (a: any, i: number) => `Question ${i + 1}: ${a.question}\nAnswer: ${a.content}`
  )
  .join("\n\n---\n\n")}
`;

    const genAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const response = await genAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.3, maxOutputTokens: 2000 },
    });

    const rawEvaluationText = response.text;
    if (!rawEvaluationText) {
      console.error("Raw AI response for evaluation was empty.");
      return NextResponse.json(
        { error: "Failed to get a valid evaluation from AI." },
        { status: 500 }
      );
    }
    let judged: { index: number; score: number; feedback: string }[] = [];
    try {
      // get json part
      const cleanedJson = rawEvaluationText.match(/\[[\s\S]*\]/)?.[0];
      if (!cleanedJson) throw new Error("No valid JSON array found in AI response.");
      judged = JSON.parse(cleanedJson);
    } catch (err) {
      console.error("Error parsing AI evaluation JSON:", err);
      console.error("Raw AI response for evaluation:", rawEvaluationText);
      return NextResponse.json(
        { error: "Failed to parse AI evaluation response." },
        { status: 500 }
      );
    }

    // update answers
    for (const j of judged) {
      const matchedAnswer = insertedAnswers.find(
        (a) => a.question_index === j.index 
      );
      if (!matchedAnswer) continue;

      const { error: updateError } = await supabase
        .from("answers")
        .update({
          ai_score: Math.max(0, Math.min(100, j.score ?? 0)),
          ai_feedback: j.feedback || "No feedback provided",
        })
        .eq("id", matchedAnswer.id);

      if (updateError) console.error(`❌ Error updating answer for index ${j.index}:`, updateError);
    }

    const scores = judged.map((j) => j.score).filter((s) => typeof s === "number");
    const avgScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const summaryPrompt = `
You are an expert hiring manager providing a final summary of a candidate's interview performance.
Based on the questions, their answers, and the individual feedback, write a concise, one-paragraph summary.
Address their overall knowledge, clarity of communication, and potential strengths or weaknesses.
Do NOT output JSON or any other format. Just the text of the summary itself.

Here is the full interview context:
${judged
  .map(
    (j, i) =>
      `Question ${i + 1}: ${answers[i].question}\nCandidate's Answer: ${
        answers[i].content
      }\nEvaluation: Score ${j.score}/100 - ${j.feedback}`
  )
  .join("\n\n")}
`;
const summaryResult = await genAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: summaryPrompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });
    const summaryText = summaryResult.text;
    
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
          room_code: roomId,
          candidate_id: candidateId,
          final_score: avgScore,
          participant_name: participantName,
          summary: summaryText || `AI evaluation completed. Average score: ${avgScore}/100.`,
        },
      ]);

    if (summaryError) console.error("Summary insert error:", summaryError);

    return NextResponse.json({
      average: avgScore,
      totalEvaluated: scores.length,
      judged,
      summary: summaryText,
    });

  } catch (err: any) {
    console.error("AI judge route error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
