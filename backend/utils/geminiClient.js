import axios from "axios";

export const getRecipeSuggestion = async (ingredients) => {
  const prompt = `Suggest 3 recipes that can be made using these ingredients: ${ingredients.join(", ")}`;
  
  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      { contents: [{ parts: [{ text: prompt }] }] },
      { params: { key: process.env.GEMINI_API_KEY } }
    );
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error("Failed to generate recipe");
  }
};
