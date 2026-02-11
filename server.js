const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");
const { toFile } = require("openai/uploads");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/speech-to-text", upload.single("audio"), async (req, res) => {
  try {
    const { entryType, userId } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "audio is required" });
    }

    if (!entryType || !userId) {
      return res.status(400).json({ error: "entryType and userId are required" });
    }

    const audioFile = await toFile(
      req.file.buffer,
      req.file.originalname || "voice-input.webm",
      { type: req.file.mimetype || "audio/webm" }
    );

    const transcription = await client.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1"
    });

    return res.json({ text: transcription.text || "" });
  } catch (error) {
    console.error("[speech-to-text] failed:", error);
    return res.status(500).json({ error: "speech transcription failed" });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Speech-to-text server listening on ${port}`);
});
