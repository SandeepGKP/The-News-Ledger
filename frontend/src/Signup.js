import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer,toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://the-news-ledger.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Signup successful! Logging you in...");
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('token', data.token); // Assuming the registration response includes a token
        localStorage.setItem('username', username); // Store the username directly
        navigate('/login'); // Navigate to home after successful signup and login
      } else {
        toast.error(data.message || "Signup failed!");
      }
    } catch (err) {
      toast.error('Signup error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-400">
      <ToastContainer />
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl flex overflow-hidden">
        {/* Left Side */}
        <div className="w-1/2 bg-gradient-to-b from-sky-300 to-sky-500 p-10 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-8">THE NEWS LEDGER</h2>
            <h1 className="text-4xl font-bold mb-4">Welcome to...</h1>
            <p>Get the latest and most trending news curated just for you. Stay informed with our daily updates.</p>
          </div>
          <p className="text-sm">Your go-to source for real-time news</p>
        </div>

        {/* Right Side (Signup Form) */}
        <div className="w-1/2 p-10">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Signup</h2>
          <p className="text-gray-500 mb-6">Create your account and start exploring the news world!</p>
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              minLength={5}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="User Name"
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded">
              SIGNUP
            </button>
            <div className="flex justify-between text-sm">
              <p>Already have an account? <Link to="/login" className="text-blue-500">Login</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
