const axios = require('axios');

const summarizeText = async (text) => {
  try {
    const response = await axios.post('https://api.x.ai/v1/chat/completions', {
      messages: [
        {
          role: 'user',
          content: `Summarize the following news article in 2-3 sentences: ${text}`
        }
      ],
      model: 'grok-beta'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error summarizing:', error.response ? error.response.data : error.message);
    throw new Error('Failed to generate summary');
  }
};

module.exports = { summarizeText };
