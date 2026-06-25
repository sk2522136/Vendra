import express from "express";
import { parseVoiceCommand } from "../utils/voiceParser.js";
import Product from "../models/Product.js";

const router = express.Router();

router.post("/parse-command", async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "No transcript provided",
      });
    }

    // Sab products fetch karo
    const products = await Product.find({ isActive: true });

    // Gemini se parse karo
    const parsed = await parseVoiceCommand(transcript, products);

    if (parsed.confidence < 0.6) {
      return res.status(200).json({
        success: false,
        message: "Low confidence. Please repeat.",
        confidence: parsed.confidence,
      });
    }

    res.json({
      success: true,
      ...parsed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;