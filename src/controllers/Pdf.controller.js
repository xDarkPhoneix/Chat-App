import { Queue } from "bullmq";
import { getRedis } from "../utils/redisConfig.js";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import DocumentChunk from "../Models/document.model.js";
import mongoose from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { API_ERROR } from "../utils/ApiError.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});
/* ---------------- REDIS EVENTS ---------------- */

let myQueue;
export const initializeQueue = () => {
  myQueue = new Queue("file-upload-queue", {
    connection: getRedis(),
  });
};
export const getQueue = () => {
  if (!myQueue) {
    throw new Error("Queue not initialized");
  }

  return myQueue;
};

import fs from "fs";
import { uploadPdfToCloudinary } from "../utils/cloudinaryPdf.js";

const uploadpdf = asynchandler(async (req, res) => {
  const userId = req.user._id;

  console.log("📥 Received upload request");

  if (!req.file) {
    throw new API_ERROR(400, "No PDF uploaded");
  }

  console.log(
    "📄 Uploaded:",
    req.file.originalname
  );

  const uploadedPdf =
    await uploadPdfToCloudinary(req.file.path);

  if (!uploadedPdf) {
    throw new API_ERROR(
      500,
      "Failed to upload PDF to Cloudinary"
    );
  }

  await getQueue().add("file-ready", {
    userId,

    filename: req.file.originalname,

    fileUrl: uploadedPdf.secure_url,

    publicId: uploadedPdf.public_id,

    mimetype: req.file.mimetype,

    size: req.file.size,
  });

  return res.status(200).json({
    success: true,

    message:
      "PDF uploaded and queued successfully",

    file: {
      filename: req.file.originalname,

      url: uploadedPdf.secure_url,

      publicId: uploadedPdf.public_id,
    },
  });
});

const pdfchat = asynchandler(async (req, res) => {
  
    const { query } = req.body;


    /* ---------- EMBEDDING ---------- */

    const embeddingResponse = await ai.models.embedContent({
      model: "gemini-embedding-2",

      contents: query,
    });

    const queryEmbedding = embeddingResponse.embeddings[0].values;

    console.log("🧠 Query Vector:", queryEmbedding.length);


    /* ---------- VECTOR SEARCH ---------- */

    const result = await DocumentChunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          filter: {
        userId: req.user._id,
      },
          numCandidates: 100,
          limit: 5,
        },
        
      },

      {
        $project: {
          text: 1,
          documentId: 1,
          chunkIndex: 1,
          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ]);

    

    /* ---------- CONTEXT ---------- */

    const context = result.map((item) => item.text).join("\n");

    /* ---------- GENERATE ANSWER ---------- */

    const chatRes = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",

      config: {
        responseMimeType: "application/json",

        systemInstruction: `
You are a helpful and professional AI assistant for a user-based PDF chat application. You strictly generate JSON responses.

Return ONLY valid JSON.

Format:
{
  "answer":"string",
  "sources":["string"]
}

Rules:
- Answer the user's question ONLY using the provided Context extracted from their uploaded documents.
- If the answer cannot be found in the provided Context, return the following JSON exactly:
{
  "answer":"I'm sorry, but I couldn't find any information regarding that in the documents you've uploaded. Please try rephrasing your question or uploading a relevant document.",
  "sources":[]
}
`,
      },

      contents: `
Context:
${context}

Question:
${query}
`,
    });

    let parsed;

    try {
      parsed = JSON.parse(chatRes.text);
    } catch {
      parsed = {
        answer: "Failed to parse AI response",

        sources: [],
      };
    }

    return res.json({
      success: true,

      message: parsed,

      matches: result,
    });
  
});

export { uploadpdf, pdfchat };
