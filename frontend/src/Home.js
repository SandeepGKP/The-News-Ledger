import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

import 'react-loading-skeleton/dist/skeleton.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { ToastContainer, toast } from 'react-toastify';
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FaMicrophone } from 'react-icons/fa';
import { BiErrorCircle } from "react-icons/bi";
import { MdSearchOff } from "react-icons/md";


const beep = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");

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

      if (searchQuery.trim()) {
        const formattedQuery = searchQuery.trim().split(/\s+/).join(' AND ');
        url += `&q=${encodeURIComponent(formattedQuery)}`;
      }

      const res = await axios.get(url);
      setNews(Array.isArray(res.data.articles) ? res.data.articles : []);
      setError(false);

      if (searchQuery.trim() && !searchHistory.includes(searchQuery.trim())) {
        const updatedHistory = [searchQuery.trim(), ...searchHistory.slice(0, 9)];
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
        setSearchHistory(updatedHistory);
      }

    } catch (err) {
      setNews([]);
      setError(true);
      console.error("API Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [category, country, page, query, searchHistory]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchNews();
    }, 1000); // debounce delay in ms

    // cleanup to cancel previous timeout if dependency changes
    return () => clearTimeout(handler);
  }, [fetchNews]);


  useEffect(() => {
    const storedBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setBookmarks(storedBookmarks);
    const storedSearchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(storedSearchHistory);
  }, []);

  useEffect(() => {
    if (transcript && !listening) {
      setQuery(transcript);
      fetchNews(transcript);
      resetTranscript();
    }
  }, [transcript, listening, fetchNews, resetTranscript]);

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
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    fetchNews(suggestion);
    setShowSuggestions(false);
  };

  const handleVoiceSearch = () => {
    beep.playbackRate = 0.4;
    beep.play();
    setTimeout(() => {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: false, language: 'en-IN' });
    }, 1000);

  };

  const handleBookmark = (article) => {
    const existingBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const exists = existingBookmarks.some((a) => a.url === article.url);
    if (!exists) {
      const updatedBookmarks = [article, ...existingBookmarks];
      localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
      toast.success('Bookmarked!', { className: "custom-toast" });
      setBookmarks(updatedBookmarks);
    }
  };

  const handleRemoveBookmark = (article) => {
    const updatedBookmarks = bookmarks.filter((a) => a.url !== article.url);
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
    toast.success('Bookmark removed!', { className: "custom-toast" })
    setBookmarks(updatedBookmarks);
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
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <ToastContainer position="top-right" toastClassName="custom-toast" autoClose={1000} hideProgressBar={false} closeOnClick draggable />
        <div className="sticky top-0 z-40 bg-inherit py-2 mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="border px-2 py-1 bg-gray-200 dark:bg-gray-700 placeholder-slate-400 rounded text-white"
                value={listening ? transcript : query}
                onChange={handleSearchInputChange}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                      onMouseDown={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button onClick={() => fetchNews()} className="px-3 py-1 bg-blue-600 text-white rounded">Search</button>
            <button onClick={handleVoiceSearch} className="px-3 py-1 bg-green-600 rounded "><FaMicrophone size={24} /></button>

            <select value={category} onChange={(e) => setCategory(e.target.value)} className="border px-2 py-1 bg-gray-200 dark:bg-gray-700 text-white rounded">
              <option value="general">General</option>
              <option value="technology">Technology</option>
              <option value="science">Science</option>
              <option value="sports">Sports</option>
              <option value="health">Health</option>
              <option value="entertainment">Entertainment</option>
              <option value="business">Business</option>
            </select>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="border px-2 py-1 bg-gray-200 dark:bg-gray-700 text-white rounded">
              <option value="in">India</option>
              <option value="us">USA</option>
              <option value="gb">UK</option>
              <option value="ca">Canada</option>
              <option value="au">Australia</option>
              <option value="de">Germany</option>
              <option value="fr">France</option>
              <option value="it">Italy</option>
              <option value="es">Spain</option>
              <option value="jp">Japan</option>
              <option value="cn">China</option>
              <option value="br">Brazil</option>
              <option value="za">South Africa</option>
              <option value="ru">Russia</option>
              <option value="ae">United Arab Emirates</option>
            </select>
            <div className="relative ml-auto">
              <button
                onClick={() => setShowBookmarksDropdown(!showBookmarksDropdown)}
                className="px-3 py-1 bg-purple-600 text-white rounded"
              >
                Bookmarks ({bookmarks.length})
              </button>
              {showBookmarksDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                  {bookmarks.length > 0 ? bookmarks.map((article, idx) => (
                    <div key={idx} className="p-2 border-b dark:border-gray-600">
                      <h3 className="font-bold text-sm">{article.title}</h3>
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs" onClick={() => handleView(article.url)}>Read More</a>
                      <button onClick={() => handleRemoveBookmark(article)} className="text-xs text-red-500 ml-4">Remove</button>
                    </div>
                  )) : <div className="p-2">No bookmarks.</div>}
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 text-slate-300 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                {/* Thumbnail */}
                <div className="w-full h-96 rounded-xl bg-slate-200 dark:bg-slate-700" />

                {/* Channel avatar + text */}
                <div className="flex gap-3">
                  {/* <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" /> */}
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : news.length === 0 ? (
          <div className="flex items-center justify-center h-[70vh] text-xl  text-yellow-500">
            {error ? (
              <div className="flex items-center  gap-3 p-4 rounded-lg bg-grey-50 text-red-600 text-lg shadow-md">
                <BiErrorCircle className="text-2xl" />
                <span>Server Error fetching news. Please try again.</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-grey-50 text-yellow-600 text-lg shadow-md">
                <MdSearchOff className="text-2xl" />
                <span>No articles found matching your search.</span>
              </div>
            )}
          </div>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
            {news.slice(0, 10).map((article, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
                {article.image && <img src={article.image} alt="News" className="rounded w-full h-70 object-cover" />}
                <h2 className="font-serif text-md mt-2 flex-grow text-white">{article.title}</h2>
                <p className="text-sm mt-1 text-gray-600 dark:text-gray-400 font-serif">{article.description?.substring(0, 100)}...</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 mt-2 inline-block text-sm" onClick={() => handleView(article.url)}>Read More</a>
                <div className="flex justify-between items-center mt-2">
                  <button onClick={() => handleBookmark(article)} className="text-sm text-yellow-500">Bookmark</button>
                  <span className="text-xs text-gray-500">{getViews(article.url)} views</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {(news.length !== 0) &&
        (<div className="mt-2 flex justify-center gap-2 items-center relative ">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1  rounded disabled:opacity-50 text-blue-300"
            disabled={page === 1}
          >
            <ArrowLeft />
          </button>
          <span className="px-3 py-1">{page}</span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1  rounded text-blue-300"
          >
            <ArrowRight />
          </button>
        </div>)}
    </div>
  );
}
