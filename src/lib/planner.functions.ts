import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PlanSchema = z.object({
  summary: z.string(),
  why_it_matters: z.string(),
  timeline: z.array(z.object({ phase: z.string(), duration: z.string(), focus: z.string() })),
  steps: z.array(z.object({ title: z.string(), detail: z.string() })),
  daily_habits: z.array(z.string()),
  weekly_tasks: z.array(z.string()),
  budget: z.object({
    monthly_save: z.string(),
    breakdown: z.array(z.object({ item: z.string(), amount: z.string() })),
  }),
  resources: z.array(z.object({ title: z.string(), kind: z.string(), note: z.string() })),
  first_7_days: z.array(z.string()),
  motivation: z.string(),
});

export const generateDreamPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { dream: string; dreamId?: string; context?: string }) => d)
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");

    const { output } = await generateText({
      model,
      experimental_output: Output.object({ schema: PlanSchema }),
      system:
        "You are a world-class life & business coach for Indians. Always reply in INR (₹), use Indian numbering (lakhs/crores) where natural, and be concrete, actionable, kind, and direct. Never give generic fluff.",
      prompt: `Build a complete action plan for this dream: "${data.dream}".${data.context ? `\nContext: ${data.context}` : ""}\n\nReturn: summary, why it matters, timeline phases, step-by-step roadmap, daily habits, weekly tasks, monthly budget plan with breakdown, learning resources (books/courses/people/youtube), first 7 days tasks, and a one-line motivational push.`,
    });

    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("dream_plans" as any)
      .insert({ user_id: userId, dream_id: data.dreamId ?? null, dream_text: data.dream, plan: output } as any)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as any;
  });
