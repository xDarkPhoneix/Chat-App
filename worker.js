import { Worker } from "bullmq";
import IORedis from "ioredis";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import path from "path";    
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";
import fs from "fs";

import DocumentChunk from  "./src/Models/document.model.js";
import  connectDB  from "./src/db/dbconnect.js";
import mongoose from "mongoose";

dotenv.config();

await connectDB();


console.log(
  "Worker DB:",
  mongoose.connection.db.databaseName
);

/* ---------------- REDIS CONNECTION ---------------- */

const redisConnection = new IORedis({
  host: process.env.AIVEN_HOST,

  port: Number(process.env.AIVEN_PORT),

  username: process.env.AIVEN_USERNAME,

  password: process.env.AIVEN_PASSWORD,

  tls: {},

  maxRetriesPerRequest: null,
});

/* ---------- REDIS EVENT LISTENERS ---------- */

redisConnection.on("connect", () => {
  console.log("✅ Redis Connected");
});

redisConnection.on("ready", () => {
  console.log("🚀 Redis Ready");
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

redisConnection.on("close", () => {
  console.log("⚠️ Redis Connection Closed");
});

redisConnection.on("reconnecting", () => {
  console.log("🔄 Redis Reconnecting...");
});

/* ---------------- WORKER ---------------- */

const worker = new Worker(
  "file-upload-queue",

  async (job) => {
    try {
      console.log("✅ Job Received:", job.data);

      // BullMQ already parses objects
      const data = job.data;
      const { userId } = job.data;

      /* ---------- READ PDF ---------- */

      const pdfBuffer = fs.readFileSync(data.path);

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
      });

      const pdfDoc = await loadingTask.promise;

      let text = "";

      /* ---------- EXTRACT TEXT ---------- */

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);

        const content = await page.getTextContent();

        text +=
          content.items
            .map((item) => item.str)
            .join(" ") + "\n";
      }

      console.log("📄 Text length:", text.length);

      /* ---------- SPLIT TEXT ---------- */

      const splitter =
        new RecursiveCharacterTextSplitter({
          chunkSize: 300,
          chunkOverlap: 50,
        });

      const chunks = await splitter.splitText(text);

      console.log("✂️ Chunks created:", chunks.length);

      /* ---------- GEMINI EMBEDDINGS ---------- */

      const genAI = new GoogleGenAI({
        apiKey: process.env.GOOGLE_API_KEY,
      });

      const documentId = crypto.randomUUID();

      const documents = await Promise.all(
        chunks.map(async (chunk, i) => {
          const result =
            await genAI.models.embedContent({
              model: "gemini-embedding-2",
              contents: chunk,
            });

          return {
              userId,
            documentId,
            chunkIndex: i,
            text: chunk,
            embedding:
              result.embeddings[0].values,
          };
        })
      );

      /* ---------- STORE IN MONGODB ---------- */

      await DocumentChunk.insertMany(documents);

      console.log(
        "✅ Embeddings stored in MongoDB Atlas"
      );

      // Remove the PDF from the local system
      try {
        fs.unlinkSync(data.path);
        console.log(`🗑️ Removed local file: ${data.path}`);
      } catch (err) {
        console.error(`⚠️ Failed to remove local file: ${data.path}`, err);
      }

    } catch (error) {
      console.error("❌ Worker Error:", error);

      // Important for BullMQ failure handling
      throw error;
    }
  },

  {
    connection: redisConnection,
  }
);

/* ---------- WORKER EVENTS ---------- */

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`❌ Job ${job?.id} failed`);

  console.error(err);
});