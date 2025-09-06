import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Login from './login';
import Signup from './Signup';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const Root = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Removed localStorage.removeItem('isLoggedIn') to prevent clearing login status after signup
    if (!sessionStorage.getItem('visited')) {
      sessionStorage.setItem('visited', 'true');
    }

    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    setLoading(false); // Done checking login
  }, []);

  if (loading) return null; // Prevent premature redirect

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/*" element={isLoggedIn ? <App /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
