// voiceParser.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const parseVoiceCommand = async (transcript, products) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const productNames = products.map((p) => p.name).join(", ");

const prompt = `
You are an AI-powered POS voice command parser.
Your task is to analyze a voice transcript strictly in English and extract structured information.

Available Products:
${productNames}

Voice Transcript:
"${transcript}"

Return ONLY a valid JSON object.
Do NOT include markdown, explanations, comments, or code fences.

Expected JSON Schema:
{
"action": "ADD_TO_CART" | "CHECKOUT" | "UNKNOWN",
"product": string | null,
"quantity": number | null,
"paymentMethod": "cash" | "credit" | null,
"confidence": number
}

Instructions:

1. Product Matching:
- Compare the spoken product to the closest product from the Available Products list (case-insensitive).
- Handle variations automatically: For example, if the transcript says "2 Apple", "apples", or "Apple", match it to the closest exact string present in the Available Products list.
- If no reliable match exists, set product to null.

2. Quantity Extraction:
- Extract any number explicitly mentioned before or after the product (e.g., "2 Apple" -> 2, "five apples" -> 5, "one Apple" -> 1).
- If no quantity is explicitly mentioned in the transcript, default quantity to 1.

3. Action Detection:
- Use "ADD_TO_CART" when the user is adding, selecting, or requesting products.
- Use "CHECKOUT" when the user wants to complete payment or billing.
- Use "UNKNOWN" if the intent is unclear.

4. Payment Method Detection:
- "cash", "naqad", "cash payment" → "cash"
- "credit", "card", "stripe", "credit card" → "credit"
- Otherwise null.

5. Confidence Score:
- Return a decimal number between 0 and 1.
- High confidence (0.7–1.0) for clear or approximate matches.
- Low confidence (0.0–0.69) for completely uncertain or unrecognized results.

Important Rules:
- Return ONLY JSON.
- Never return extra text.
- Match the product name as closely as possible to the Available Products list.
`;
    

const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { action: "UNKNOWN", confidence: 0 };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error("Voice parsing error:", error);
    return { action: "UNKNOWN", confidence: 0, error: error.message };
  }
};