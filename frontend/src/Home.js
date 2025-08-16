import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { ToastContainer,toast } from "react-toastify";

const beep = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('general');
  const [country, setCountry] = useState('in');
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [bookmarks, setBookmarks] = useState([]);

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      let url = `https://the-news-ledger.onrender.com/api/news?category=${category}&country=${country}&page=${page}`;

      if (query.trim()) {
        url += `&q=${encodeURIComponent(query.trim())}`;
      }

      const res = await axios.get(url);
      console.log(res.data);
      setNews(res.data.articles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, country, page, query]); // deps moved here

  // Fetch news when category/country/page/query change
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Fetch bookmarks from localStorage on page load
  useEffect(() => {
    const storedBookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    setBookmarks(storedBookmarks);
  }, []);

  // Voice search handling
  useEffect(() => {
    if (transcript !== "" && listening === false) {
      setQuery(transcript);
      fetchNews();
    }
  }, [transcript, listening, fetchNews]); // include fetchNews


  const handleBookmark = (article) => {
    const existingBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const exists = existingBookmarks.find((a) => a.url === article.url);
    if (!exists) {
      const updatedBookmarks = [article, ...existingBookmarks];
      localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
      setBookmarks(updatedBookmarks); // Update the bookmarks state immediately
      toast.success("Article bookmarked successfully!");
    }
  };

  const handleRemoveBookmark = (article) => {
    const updatedBookmarks = bookmarks.filter((a) => a.url !== article.url);
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
    setBookmarks(updatedBookmarks); // Update the bookmarks state after removal
    toast.success("Bookmark removed successfully!");
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

  const handleVoiceSearch = () => {
    beep.play();
    setTimeout(() => {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: false, language: 'en-IN' });
    }, 2000);
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <div className="sticky top-10 z-40 bg-inherit py-1">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search..."
            className="border px-2 py-1 bg-gray-400 placeholder-slate-600 rounded"
            value={listening ? transcript : query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={fetchNews} className="px-3 py-1 bg-blue-600 text-white rounded">Search</button>
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
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={300} />
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center text-yellow-500 mt-10 text-xl">
          No article found matching your search! 😕
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Bookmarked Articles on Top */}
          {bookmarks.length > 0 && (
            <div className="col-span-full mb-4">
              <h2 className="font-bold text-xl">Bookmarked Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {bookmarks.map((article, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                    {article.urlToImage && (
                      <img src={article.urlToImage} alt="News" className="rounded w-full h-48 object-cover" />
                    )}
                    <h2 className="font-bold text-lg mt-2">{article.title}</h2>
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
                    <div className="mt-2">
                      <button
                        onClick={() => handleRemoveBookmark(article)}
                        className="text-sm text-red-600"
                      >
                        ❌ Remove Bookmark
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular News Articles */}
          {news.map((article, idx) => (
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

      <div className="mt-4 flex justify-center gap-4 items-center sticky top-0 z-50 bg-inherit py-2">
        <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} className="px-3 py-1 bg-gray-700 text-white rounded">⬅️ Prev</button>
        <span className="px-3 py-1 bg-gray-700 text-white rounded">Page {page}</span>
        <button onClick={() => setPage((prev) => prev + 1)} className="px-3 py-1 bg-gray-700 text-white rounded">Next ➡️</button>
      </div>
    </div>
  );
}
