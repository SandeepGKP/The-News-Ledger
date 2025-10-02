const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const summarizeText = async (text) => {
  try {
    // Log available models
    console.log('Available models:');
    try {
      const models = await genAI.listModels();
      models.forEach(model => {
        console.log(model.name);
      });
    } catch (listError) {
      console.error('Error listing models:', listError);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
    const prompt = `Summarize the following news article in 2-3 sentences: ${text}`;
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error summarizing:', error);
    throw new Error('Failed to generate summary');
  }
};

module.exports = { summarizeText };
