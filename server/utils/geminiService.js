import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getGeminiResponse = async (userMessage, context = "") => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an intelligent POS (Point of Sale) system assistant.

Your job:
- Help users with sales, products, inventory, customers and reports.
- Answer only using the provided context data.
- If information is not available in context, say you don't have enough data.
- Never make fake numbers or assumptions.

Language:
- Reply in simple easy English words.

Context Data:
${context}

User Question:
${userMessage}

Response Rules:
- Give a direct, well-structured and highly readable answer.
- Structure long reports or lists with clear headings, spacing, and bullet points.
- Use **bold text** for key numbers, amounts, and customer names to make it visually clear and easy to read at a glance.
- Do not cram everything together; use proper line breaks so it looks like a clean ledger report.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      message: text
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export default getGeminiResponse;