import { StoryPlanner, StoryPlannerInput } from "./types";
import { buildStoryPrompt } from "./prompt-builder";
import { PRMovieSchema } from "@/types/schemas";
import type { PRMovie } from "@/types/pr-movie";
import { ensureUniqueSceneIds } from "@/lib/movie/scene-utils";
import { validatePRMovie } from "@/lib/analysis/movie-validator";

export class LLMStoryPlanner implements StoryPlanner {
  private apiKey: string;
  private modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    this.apiKey =
      apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.LLM_API_KEY ||
      process.env.OPENAI_API_KEY ||
      "";
    this.modelName = modelName || process.env.GEMINI_MODEL || "gemini-2.0-flash";
  }

  async generateMovie(input: StoryPlannerInput): Promise<PRMovie> {
    if (!this.apiKey) {
      console.error("[LLMStoryPlanner] Internal configuration error: Missing server-side LLM API key (GEMINI_API_KEY / OPENAI_API_KEY) in .env");
      throw new Error("Internal server configuration error: LLM API key is not configured.");
    }

    const { systemPrompt, userPrompt } = buildStoryPrompt(input);

    try {
      // Step 1: First Attempt via LLM
      const rawOutput = await this.callLLM(systemPrompt, userPrompt);
      const cleaned = this.sanitizeJsonString(rawOutput);
      const parsed = JSON.parse(cleaned);

      parsed.version = 1;
      parsed.movieId = input.movieId;
      parsed.sourceHash = input.sourceHash;

      const zodResult = PRMovieSchema.safeParse(parsed);
      if (zodResult.success) {
        const candidateMovie = zodResult.data as PRMovie;
        const semanticValidation = validatePRMovie(candidateMovie, input.reviewModel);

        if (semanticValidation.isValid) {
          return ensureUniqueSceneIds(candidateMovie);
        }

        console.warn(
          "[LLMStoryPlanner] First LLM output failed Deterministic Semantic Validation / Hallucination Firewall:",
          semanticValidation.errors
        );
      } else {
        console.warn("[LLMStoryPlanner] First LLM output failed Zod schema validation:", zodResult.error.issues);
      }

      // Step 2: Automated 1-Step Self-Healing Retry Loop with concrete validation errors
      const errorDetails: string[] = [];
      if (!zodResult.success) {
        errorDetails.push(`Schema Errors:\n${JSON.stringify(zodResult.error.issues, null, 2)}`);
      } else {
        const semanticValidation = validatePRMovie(zodResult.data as PRMovie, input.reviewModel);
        errorDetails.push(`Semantic Validation & Hallucination Firewall Errors:\n${semanticValidation.errors.join("\n")}`);
      }

      const fixPrompt = `Your previous JSON output failed validation with the following errors:
${errorDetails.join("\n\n")}

CRITICAL CORRECTION RULES:
- Every file must exist in the PRReviewModel files list.
- Do NOT invent external services (e.g. Kafka, Redis, etc.) or performance metrics unless directly backed by PR evidence.
- Ensure every scene has a unique "id", "type", "title", and "duration".
- Return ONLY the corrected, valid PRMovie JSON object.`;

      const healedOutput = await this.callLLM(systemPrompt, `${userPrompt}\n\n${fixPrompt}`);
      const healedCleaned = this.sanitizeJsonString(healedOutput);
      const healedParsed = JSON.parse(healedCleaned);

      healedParsed.version = 1;
      healedParsed.movieId = input.movieId;
      healedParsed.sourceHash = input.sourceHash;

      const healedZod = PRMovieSchema.safeParse(healedParsed);
      if (healedZod.success) {
        const healedMovie = healedZod.data as PRMovie;
        const healedSemantic = validatePRMovie(healedMovie, input.reviewModel);

        if (healedSemantic.isValid) {
          return ensureUniqueSceneIds(healedMovie);
        }

        console.error(
          "[LLMStoryPlanner] Healed LLM output failed Deterministic Semantic Validation:",
          healedSemantic.errors
        );
        throw new Error("Generated movie failed internal semantic validation.");
      } else {
        console.error("[LLMStoryPlanner] Healed LLM output failed Zod validation:", healedZod.error.issues);
        throw new Error("Generated movie failed schema validation.");
      }
    } catch (error) {
      console.error("[LLMStoryPlanner] Movie generation pipeline failed:", error);
      throw error instanceof Error ? error : new Error("Failed to generate movie storyboard.");
    }
  }

  private sanitizeJsonString(text: string): string {
    let clean = text.trim();
    if (clean.startsWith("```json")) {
      clean = clean.slice(7);
    } else if (clean.startsWith("```")) {
      clean = clean.slice(3);
    }
    if (clean.endsWith("```")) {
      clean = clean.slice(0, -3);
    }
    return clean.trim();
  }

  private async callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
    const isGemini =
      this.modelName.includes("gemini") ||
      Boolean(process.env.GEMINI_API_KEY) ||
      this.apiKey.startsWith("AIza");

    // Official Google Gemini API
    if (isGemini) {
      const key = process.env.GEMINI_API_KEY || this.apiKey;
      const primaryModel = this.modelName.includes("gemini") ? this.modelName : "gemini-2.0-flash";
      const candidateModels = Array.from(new Set([primaryModel, "gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-2.5-flash", "gemini-1.5-flash"]));

      let lastError: Error | null = null;
      for (const model of candidateModels) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: AbortSignal.timeout(18000),
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                generationConfig: {
                  response_mime_type: "application/json",
                  temperature: 0.2,
                },
              }),
            }
          );

          if (!res.ok) {
            const errorText = await res.text();
            console.error(`[LLMStoryPlanner] Gemini API returned error (${res.status}) for model ${model}:`, errorText);
            if (candidateModels.indexOf(model) < candidateModels.length - 1) {
              console.warn(`[LLMStoryPlanner] Failing over to next Gemini candidate model...`);
              continue;
            }
            throw new Error(`Gemini API service error (${res.status})`);
          }

          const json = await res.json();
          const resultText = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!resultText) {
            console.error("[LLMStoryPlanner] Empty response payload received from Gemini API:", json);
            throw new Error("Empty response from AI provider");
          }
          return resultText;
        } catch (err: unknown) {
          lastError = err instanceof Error ? err : new Error(String(err));
          if (candidateModels.indexOf(model) < candidateModels.length - 1) {
            continue;
          }
        }
      }

      console.error("[LLMStoryPlanner] All Gemini model attempts exhausted. Last error:", lastError);
      throw lastError || new Error("Failed to generate response from AI provider");
    }

    // OpenAI API fallback
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      signal: AbortSignal.timeout(18000),
      body: JSON.stringify({
        model: this.modelName || "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[LLMStoryPlanner] OpenAI API returned error (${res.status}):`, errorText);
      throw new Error(`OpenAI API service error (${res.status})`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
  }
}

