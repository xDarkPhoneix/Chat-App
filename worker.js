import { Worker } from "bullmq";
import IORedis from "ioredis";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";
import mongoose from "mongoose";

import DocumentChunk from "./src/Models/document.model.js";
import connectDB from "./src/db/dbconnect.js";

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

/* ---------- REDIS EVENTS ---------- */

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

/* ---------- GEMINI ---------- */

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

/* ---------------- WORKER ---------------- */

const worker = new Worker(
  "file-upload-queue",

  async (job) => {
    try {
      console.log("✅ Job Received:", job.data);

      const {
        userId,
        fileUrl,
        filename,
      } = job.data;

      if (!fileUrl) {
        throw new Error(
          "fileUrl is missing from job data"
        );
      }

      /* ---------- DOWNLOAD PDF ---------- */

      console.log(
        "📥 Downloading PDF from Cloudinary..."
      );

      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to download PDF: ${response.status}`
        );
      }

      const pdfBuffer = Buffer.from(
        await response.arrayBuffer()
      );

      console.log(
        "✅ PDF Downloaded:",
        filename
      );

      /* ---------- LOAD PDF ---------- */

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
      });

      const pdfDoc = await loadingTask.promise;

      let text = "";

      /* ---------- EXTRACT TEXT ---------- */

      for (
        let pageNum = 1;
        pageNum <= pdfDoc.numPages;
        pageNum++
      ) {
        const page =
          await pdfDoc.getPage(pageNum);

        const content =
          await page.getTextContent();

        text +=
          content.items
            .map((item) => item.str)
            .join(" ") + "\n";
      }

      console.log(
        `📄 Extracted Text Length: ${text.length}`
      );

      /* ---------- SPLIT INTO CHUNKS ---------- */

      const splitter =
        new RecursiveCharacterTextSplitter({
          chunkSize: 300,
          chunkOverlap: 50,
        });

      const chunks =
        await splitter.splitText(text);

      console.log(
        `✂️ Chunks Created: ${chunks.length}`
      );

      /* ---------- CREATE DOCUMENT ID ---------- */

      const documentId =
        crypto.randomUUID();

      /* ---------- EMBEDDINGS ---------- */

      const documents = [];

      for (
        let i = 0;
        i < chunks.length;
        i++
      ) {
        const chunk = chunks[i];

        try {
          const result =
            await genAI.models.embedContent({
              model:
                "gemini-embedding-2",
              contents: chunk,
            });

          documents.push({
            userId,
            documentId,
            chunkIndex: i,
            text: chunk,
            embedding:
              result.embeddings[0].values,
          });

          if (i % 20 === 0) {
            console.log(
              `📌 Embedded chunk ${i + 1}/${chunks.length}`
            );
          }
        } catch (err) {
          console.error(
            `❌ Failed chunk ${i}:`,
            err.message
          );
        }
      }

      /* ---------- STORE ---------- */

      if (documents.length > 0) {
        await DocumentChunk.insertMany(
          documents
        );

        console.log(
          `✅ Stored ${documents.length} chunks`
        );
      }

      console.log(
        "🎉 PDF Processing Complete"
      );

      return {
        success: true,
        documentId,
        chunks: documents.length,
      };
    } catch (error) {
      console.error(
        "❌ Worker Error:",
        error
      );

      throw error;
    }
  },

  {
    connection: redisConnection,
    concurrency: 2,
  }
);

/* ---------- EVENTS ---------- */

worker.on("completed", (job) => {
  console.log(
    `✅ Job ${job.id} completed`
  );
});

worker.on("failed", (job, err) => {
  console.log(
    `❌ Job ${job?.id} failed`
  );

  console.error(err);
});

/* ---------- SHUTDOWN ---------- */

process.on("SIGTERM", async () => {
  console.log(
    "🛑 Shutting down worker..."
  );

  await worker.close();
  await redisConnection.quit();

  process.exit(0);
});