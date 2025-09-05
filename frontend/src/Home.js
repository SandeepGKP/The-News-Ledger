import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { ToastContainer, toast } from 'react-toastify';


const beep = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('general');
  const [country, setCountry] = useState('in');
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarksDropdown, setShowBookmarksDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState(false);

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const fetchNews = useCallback(async (searchQuery = query) => {
    setLoading(true);
    try {
      let url = `https://the-news-ledger.onrender.com/api/news?category=${category}&lang=en&country=${country}&max=12&page=${page}`;

      // Add q only if not empty, and format for multi-word search
      if (searchQuery.trim()) {
        const formattedQuery = searchQuery.trim().split(/\s+/).join(' AND ');
        url += `&q=${encodeURIComponent(formattedQuery)}`;
      }

      const res = await axios.get(url);
      console.log(res.data);
      setNews(Array.isArray(res.data.articles) ? res.data.articles : []);
      setError(false); // Clear any previous errors on successful fetch

      // Add query to search history if it's a new, non-empty query
      if (searchQuery.trim() && !searchHistory.includes(searchQuery.trim())) {
        const updatedHistory = [searchQuery.trim(), ...searchHistory.slice(0, 9)]; // Keep last 10
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
        setSearchHistory(updatedHistory);
      }

    } catch (err) {
      setNews([]); // Ensure news is empty on error
      if (err.response && err.response.status === 500) {
        // Server responded with a status code outside 2xx
        setError(true);
        console.error("Error Status:", err.response.status);
      } else {
        setError(true); // Set error for other types of fetch errors as well
        console.error("API Error:", err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [category, country, page, query, searchHistory]); // Dependencies for useCallback

  // Fetch news when the category, country, page, or query changes
  useEffect(() => {
    fetchNews();
  }, [fetchNews]); // Trigger fetch when fetchNews changes (due to useCallback dependencies)

  // Fetch bookmarks and search history from localStorage on page load
  useEffect(() => {
    const storedBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setBookmarks(storedBookmarks);
    const storedSearchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(storedSearchHistory);
  }, []);

  useEffect(() => {
    if (transcript !== '' && listening === false) {
      setQuery(transcript);
      fetchNews(transcript); // Fetch news after voice search is completed
      resetTranscript(); // Clear transcript after it's been used
    }
  }, [transcript, listening, fetchNews, resetTranscript]); // Add resetTranscript to dependencies

  // Update suggestions based on current query
  useEffect(() => {
    if (query.trim() === '') {
      setSuggestions([]);
      return;
    }
    const filteredSuggestions = searchHistory.filter(historyItem =>
      historyItem.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  }, [query, searchHistory]);

  const handleSearchInputChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestions(true); // Show suggestions when typing
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    fetchNews(suggestion);
    setShowSuggestions(false); // Hide suggestions after selection
  };

  const handleVoiceSearch = () => {
    beep.play();
    setTimeout(() => {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: false, language: 'en-IN' });
      setShowSuggestions(true); // Show suggestions during voice input
    }, 2000);
  };

  const handleBookmark = (article) => {
    const existingBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const exists = existingBookmarks.find((a) => a.url === article.url);
    if (!exists) {
      const updatedBookmarks = [article, ...existingBookmarks];
      localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
      toast.success('Bookmarked!', { className: "custom-toast" });
      setBookmarks(updatedBookmarks); // Update the bookmarks state immediately
    }
  };

  const handleRemoveBookmark = (article) => {
    const updatedBookmarks = bookmarks.filter((a) => a.url !== article.url);
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
    toast.success('Bookmark removed!', { className: "custom-toast" })
    setBookmarks(updatedBookmarks); // Update the bookmarks state after removal
  };

  const handleView = (url) => {
    const views = JSON.parse(localStorage.getItem('views') || '{}');
    views[url] = (views[url] || 0) + 1;
    localStorage.setItem('views', JSON.stringify(views));
  };

  const getViews = (url) => {
    const views = JSON.parse(localStorage.getItem('views') || '{}');
    return views[url] || 0;
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" toastClassName="custom-toast" autoClose={1000} hideProgressBar={false} closeOnClick draggable />
      <div className="sticky top-10 z-40 bg-inherit py-1">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="border px-2 py-1 bg-gray-400 placeholder-slate-600 rounded"
              value={listening ? transcript : query}
              onChange={handleSearchInputChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // Delay to allow click on suggestion
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                    onMouseDown={() => handleSuggestionClick(suggestion)} // Use onMouseDown to trigger before onBlur
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button onClick={() => fetchNews()} className="px-3 py-1 bg-blue-600 text-white rounded">Search</button>
          <button onClick={handleVoiceSearch} className="px-3 py-1 bg-green-600 text-white rounded">🎤 Voice Search</button>

          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border px-2 py-1 bg-slate-400 rounded text-black">
            <option value="general">General</option>
            <option value="technology">Technology</option>
            <option value="science">Science</option>
            <option value="sports">Sports</option>
            <option value="health">Health</option>
            <option value="entertainment">Entertainment</option>
            <option value="business">Business</option>
          </select>

          <select value={country} onChange={(e) => setCountry(e.target.value)} className="border px-2 py-1 bg-gray-400 rounded text-black">
            <option value="in">India</option>
            <option value="us">USA</option>
            <option value="gb">UK</option>
            <option value="ru">Russia</option>
            <option value="fr">France</option>
            <option value="jp">Japan</option>
            <option value="au">Australia</option>
            <option value="ae">UAE</option>
            <option value="sg">Singapore</option>
          </select>

          <div className="relative ml-auto"> {/* Added ml-auto here */}
            <button
              onClick={() => setShowBookmarksDropdown(!showBookmarksDropdown)}
              className="px-3 py-1 bg-purple-600 text-white rounded"
            >
              Bookmarks ({bookmarks.length})
            </button>
            {showBookmarksDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                {bookmarks.length === 0 ? (
                  <div className="p-4 text-gray-800 dark:text-gray-200">No bookmarks yet.</div>
                ) : (
                  bookmarks.map((article, idx) => (
                    <div key={idx} className="p-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                      <h3 className="font-bold text-md text-gray-900 dark:text-gray-100">{article.title}</h3>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm inline-block mt-1"
                        onClick={() => { handleView(article.url); setShowBookmarksDropdown(false); }}
                      >
                        Read More
                      </a>
                      <button
                        onClick={() => handleRemoveBookmark(article)}
                        className="text-sm text-red-600 ml-10"
                      >
                        remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={300} />
          ))}
        </div>
      ) : news.length === 0 ? (
        error ? (
          <div className="text-center text-red-500 mt-10">
            Error fetching news. Please try again later.
          </div>
        ) : (
          <div className="text-center text-yellow-500 mt-10 text-xl">
            No article found matching your search! 😕
          </div>

        )) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Regular News Articles */}
          {news.slice(0, 9).map((article, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              {article.urlToImage && (
                <img src={article.urlToImage} alt="News" className="rounded w-full h-48 object-cover" />
              )}
              <h2 className="font-bold text-lg mt-2 text-white">{article.title}</h2>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">{article.description}</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 mt-2 inline-block"
                onClick={() => handleView(article.url)}
              >
                Read More
              </a>
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => handleBookmark(article)}
                  className="text-sm text-yellow-600"
                >
                  📌 Bookmark
                </button>
                <span className="text-sm text-gray-500">👁️ {getViews(article.url)} views</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-center gap-2 items-center sticky top-0 z-50 bg-inherit py-2">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="px-1 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={page === 1}
        >
          ⬅️
        </button>
        <span className="px-4 py-1 bg-gray-700 text-white rounded-md">{page}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          className="px-1 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
        >
          ➡️
        </button>
      </div>
    </div>
  );
}
