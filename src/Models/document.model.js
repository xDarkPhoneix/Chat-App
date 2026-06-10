import mongoose from "mongoose";

const DocumentChunkSchema = new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  documentId: String,
  chunkIndex: Number,
  text: String,

  embedding: {
    type: [Number],
    required: true,
  },
});

export default mongoose.model(
  "DocumentChunk",
  DocumentChunkSchema,
);