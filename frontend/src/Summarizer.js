import React, { useState } from 'react';
import axios from 'axios';

const Summarizer = ({ article, onClose }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('https://the-news-ledger.onrender.com/api/summarize', {
        text: `${article.title}. ${article.description || ''} ${article.content || ''}`
      });
      setSummary(response.data.summary);
    } catch (err) {
      setError('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">{article.title}</h3>
        {summary && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Summary:</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{summary}</p>
          </div>
        )}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex space-x-2">
          {!summary && !error && (
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Summarizing...' : 'Summarize'}
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Summarizer;
