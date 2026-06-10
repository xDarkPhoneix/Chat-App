import { GoogleGenAI } from "@google/genai";
import { asynchandler } from "../utils/asynchandler.js";
import { API_ERROR } from "../utils/ApiError.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const handleAiChat = asynchandler(async (req, res) => {
  const { query } = req.body;

  if (!query?.trim()) {
    throw new API_ERROR(400, "Query is required");
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  if (res.flushHeaders) {
    res.flushHeaders();
  }

  try {
    let responseStream;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        responseStream = await ai.models.generateContentStream({
          model: "gemini-2.5-flash",

          config: {
            temperature: 0.7,

            systemInstruction: `
You are Nova, an intelligent personal AI assistant.

Your role:
- Help users with productivity, learning, coding, research, planning, writing, and decision-making.
- Be concise by default.
- Give detailed explanations when requested.
- Act like a trusted assistant, not just a chatbot.
- Ask clarifying questions when needed.
- Break complex tasks into actionable steps.
- When explaining technical concepts, teach step-by-step.
- For coding questions:
  - Prefer clean, production-ready code.
  - Explain important design choices.
  - Mention potential bugs and edge cases.
- Never invent facts.
- If uncertain, clearly say so.
- Use markdown when useful.
            `,
          },

          contents: [
            {
              role: "user",
              parts: [
                {
                  text: query,
                },
              ],
            },
          ],
        });

        break;
      } catch (error) {
        if (error.status === 503 && attempt < 3) {
          console.log(`Gemini overloaded. Retrying (${attempt}/3)...`);

          await sleep(2000 * attempt);
          continue;
        }

        throw error;
      }
    }

    let fullResponse = "";

    for await (const chunk of responseStream) {
      const text = chunk.text;

      if (!text) continue;

      fullResponse += text;

      res.write(
        `data: ${JSON.stringify({
          type: "chunk",
          text,
        })}\n\n`,
      );
    }

    res.write(
      `data: ${JSON.stringify({
        type: "done",
        fullResponse,
      })}\n\n`,
    );

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Gemini Error:", error);

    let errorMessage = "Failed to generate AI response.";

    if (error.status === 503) {
      errorMessage =
        "AI service is currently experiencing high demand. Please try again in a few moments.";
    }

    res.write(
      `data: ${JSON.stringify({
        type: "error",
        status: error.status || 500,
        message: errorMessage,
      })}\n\n`,
    );

    res.write("data: [DONE]\n\n");
    res.end();
  }
});
