import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
    if (!genAI) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'placeholder');
    }
    return genAI;
}

export async function generateContent(prompt: string, options: { model?: string } = {}) {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: options.model || "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}
