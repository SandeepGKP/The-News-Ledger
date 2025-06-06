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
    if (!sessionStorage.getItem('visited')) {
      localStorage.removeItem('isLoggedIn');
      sessionStorage.setItem('visited', 'true');
    }

    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    setLoading(false); // Done checking login
  }, []);

  if (loading) return null; // Prevent premature redirect

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={isLoggedIn ? '/home' : '/login'} />} />
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={isLoggedIn ? <App /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
