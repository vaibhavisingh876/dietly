import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Leaf, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../api/api';
import { saveAuth } from '../utils/auth'; // 👈 Imported saveAuth utility

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      const { token, user } = response.data;
      
      // 🎯 FIX 1: Use the utility function to store the token and the complete user object
      saveAuth({ token, user });

      // ❌ Removed old scattered localStorage.setItem calls (which were inconsistent)
      
      // 🎯 FIX 2: Manually dispatch an event to notify Nav component of successful login
      window.dispatchEvent(new Event('authChanged'));

      console.log('Login successful, redirecting to dashboard.');

      // 3. Redirect to the main application dashboard
      navigate('/analyze'); 

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Check your email and password.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('Google login is not yet implemented.');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  const handleCreateAccount = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar (omitted for brevity) */}
      <nav className="w-full px-10 py-4 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <Leaf className="w-7 h-7 text-green-600" />
          <span className="text-xl font-bold text-green-700">Dietly</span>
        </div>
      </nav>

      {/* Main Layout (omitted for brevity) */}
      <main className="flex flex-col lg:flex-row w-full py-12 px-12 flex-1 bg-white">
        {/* Left Info Section (omitted for brevity) */}
        <div className="flex-1 pr-12 hidden lg:flex flex-col justify-center">
          <div className="bg-green-50 rounded-lg p-12 shadow flex flex-col items-center">
            <Leaf className="w-20 h-20 text-green-500 mb-4" />
            <h2 className="text-3xl font-bold mb-2 text-green-800">Fresh & Healthy</h2>
            <p className="text-lg text-gray-700 text-center">Track your nutrition journey and make every day healthier!</p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="w-full max-w-md mx-auto lg:mx-0 mt-8 lg:mt-0">
          <div className="bg-white rounded-lg shadow p-8 border border-green-100">
            {/* App Name & Header (omitted for brevity) */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Leaf className="w-8 h-8 text-green-600" />
                <h1 className="text-3xl font-bold text-green-700">Dietly</h1>
              </div>
              <p className="text-gray-700 text-lg">Welcome back!</p>
              <p className="text-gray-500 text-sm">Login to continue your healthy journey</p>
            </div>

            {/* Error Message Display */}
            {error && (
                <div className="flex items-center gap-3 p-3 mb-5 bg-red-100 border border-red-300 text-red-700 rounded-lg font-medium">
                    <AlertTriangle className='w-5 h-5 flex-shrink-0' />
                    <span>{error}</span>
                </div>
            )}

            {/* Login Form (omitted for brevity) */}
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email / Username</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} onKeyPress={handleKeyPress} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:border-green-400 outline-none transition-all" placeholder="Enter your email" disabled={loading} />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={handleKeyPress} className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-300 rounded focus:bg-white focus:border-green-400 outline-none transition-all" placeholder="Enter your password" disabled={loading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center cursor-pointer group">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer" />
                  <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">Remember me</span>
                </label>
                <button onClick={() => console.log('Forgot password clicked')} className="text-sm text-green-600 hover:text-green-700 font-semibold transition">Forgot password?</button>
              </div>
              <button onClick={handleLogin} disabled={loading} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded font-bold text-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Logging In...</>) : ('Login')}
              </button>
            </div>
            {/* Divider and Social Login Buttons (omitted for brevity) */}
            <div className="relative my-7">...</div>
            <div className="flex gap-4">
              <button onClick={handleGoogleLogin} className="flex-1 flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-2 rounded font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all" disabled={loading}>...</button>
              <button onClick={() => console.log('Facebook login clicked')} className="flex-1 flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-2 rounded font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all" disabled={loading}>...</button>
            </div>
            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <button onClick={handleCreateAccount} className="text-green-600 hover:text-green-700 font-bold transition">
                Create account
              </button>
            </p>
          </div>
        </div>
      </main>
      {/* Footer (omitted for brevity) */}
      <footer className="w-full py-4 text-center text-sm text-gray-500 border-t mt-10">&copy; 2025 Dietly. All rights reserved.</footer>
    </div>
  );
}