import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("❌ GEMINI_API_KEY missing in .env");
}

// ✅ v1beta endpoint for listing models
const LIST_MODELS_URL =
  "https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_API_KEY;

const listModels = async () => {
  try {
    const response = await fetch(LIST_MODELS_URL);
    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Gemini ListModels Error:", data);
      throw new Error(data.error?.message || "Failed to list models from Gemini API");
    }

    console.log("✅ Available Gemini Models:");
    data.models.forEach((model) => {
      console.log(`- ${model.name}`);
      console.log(`  Supported Methods: ${model.supportedGenerationMethods.join(", ")}`);
    });
  } catch (error) {
    console.error("ListModels Error:", error);
  }
};

listModels();
