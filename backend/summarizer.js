const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const summarizeText = async (text) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Summarize the following news article in 2-3 sentences: ${text}`,
        },
      ],
      model: 'llama3-70b-8192',
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 1,
    });

    return chatCompletion.choices[0]?.message?.content || 'Summary not available.';
  } catch (error) {
    console.error('Error summarizing:', error.message || error);
    throw new Error('Failed to generate summary');
  }
};

module.exports = { summarizeText };
