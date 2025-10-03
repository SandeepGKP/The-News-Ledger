import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Login = ({ onLogin }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('https://the-news-ledger.onrender.com/api/login',
        { usernameOrEmail, password });

      toast.success("Login successful!");
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);

      if (onLogin) {
        onLogin(res.data); // ✅ update parent/auth state immediately
      }
      navigate('/home');
    } catch (err) {
      console.error("Login failed: ", err);
      toast.error(err.response?.data?.message || "Login failed!");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 to-blue-400">
      <ToastContainer />
      <div className="flex w-[900px] h-[500px] rounded-2xl shadow-lg overflow-hidden bg-white">

        {/* Left Panel */}
        <div className="w-1/2 bg-gradient-to-b from-cyan-400 to-blue-500 text-white flex flex-col justify-between p-8">
          <div>
            <h1 className="text-2xl font-bold mb-6">THE NEWS LEDGER</h1>
            <h2 className="text-4xl font-bold mb-4">Welcome to...</h2>
            <p className="text-sm text-white">Stay informed with the latest headlines, breaking stories, and updates from around the world — all in one place. Reliable news, delivered to you.</p>
          </div>
          <p className="text-sm">Get real-time updates on tech, entertainment, and more.</p>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 p-8">
          <h2 className="text-3xl font-semibold text-blue-600 mb-2">Login</h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="User Name or Email"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"

            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"

            />

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="mr-2"

              />
              <label className="text-sm text-gray-600">Remember me</label>
            </div>
            <button
              onClick={handleLogin}
              disabled={!(usernameOrEmail && password)}
              className={`w-full py-2 rounded-lg text-white transition duration-200
              ${usernameOrEmail && password ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-300 cursor-not-allowed'}`}
            >
              LOGIN
            </button>


            <div className="flex justify-between text-sm mt-4 text-gray-500">
              <span>New User? <Link to="/signup" className="text-blue-500 hover:underline">Signup</Link></span>
              {/* <span className="hover:underline cursor-pointer">Forgot your password?</span> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
