import Anthropic from "@anthropic-ai/sdk";
import type { StatBlock } from "@/lib/orv/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlanRequest {
  goal: string;
  daysPerWeek: number;
  sessionDuration: number;
  equipment: string;
  activities: string;
  notes: string;
  stats: StatBlock;
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `\
You are Dokkaebi — the AI guide from the Star Stream, speaking to a Regressor building their combat readiness through physical training.

The Regressor tracks progress across four stats:
• STR (Strength) — weight training & resistance exercises
• AGI (Agility) — running, sprints & HIIT
• CON (Constitution) — endurance & sustained effort training
• STA (Stamina) — recovery, mobility & energy work

Each workout session earns Sphere Points and Coins for their stat grid (Dokkaebi's Bag). You speak directly to the Regressor — concise, analytical, slightly formal. No excessive praise. No filler phrases.

Generate a structured weekly workout plan in this exact format:

## TACTICAL ANALYSIS
2–3 sentences on the Regressor's current stat profile and what to prioritize.

## WEEKLY PLAN
### Day 1 — [Focus] ([STAT])
- Exercise Name — X sets × Y reps [STAT]

(Repeat for all training days. Mark rest days as "### Rest — Recovery (STA)".)

## SPHERE GRID FORECAST
One sentence per stat arm that will see meaningful activation from this plan. Omit stats that won't progress.

Keep exercises realistic and matched to the equipment available. Be specific with sets/reps/duration.`;

function buildUserMessage(body: PlanRequest): string {
  const { goal, daysPerWeek, sessionDuration, equipment, activities, notes, stats } = body;
  return [
    "Current Stats:",
    `• STR ${stats.str}  AGI ${stats.agi}  CON ${stats.con}  STA ${stats.sta}`,
    "",
    `Training Goal: ${goal}`,
    `Days Per Week: ${daysPerWeek}`,
    `Session Duration: ${sessionDuration} minutes`,
    `Equipment: ${equipment}`,
    activities ? `Other Activities / Sports: ${activities}` : null,
    notes ? `Notes: ${notes}` : null,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("ANTHROPIC_API_KEY is not configured.", { status: 500 });
  }

  let body: PlanRequest;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }

  const { goal, daysPerWeek, sessionDuration, equipment, stats } = body;
  if (
    !goal ||
    typeof daysPerWeek !== "number" ||
    daysPerWeek < 1 ||
    daysPerWeek > 7 ||
    typeof sessionDuration !== "number" ||
    !equipment ||
    !stats
  ) {
    return new Response("Missing or invalid fields.", { status: 400 });
  }

  const client = new Anthropic();

  const stream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1400,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserMessage(body) }],
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
