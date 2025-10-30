import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Leaf } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log('Login attempt:', { email, password, rememberMe });
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-emerald-50 to-green-50 p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-green-200 rounded-full opacity-30 blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-emerald-200 rounded-full opacity-30 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-100 rounded-full opacity-20 blur-2xl"></div>
      
      {/* Decorative Lines */}
      <svg className="absolute top-20 left-10 w-16 h-16 text-green-400 opacity-40" viewBox="0 0 100 100">
        <path d="M10 50 Q 30 20, 50 50 T 90 50" stroke="currentColor" strokeWidth="3" fill="none"/>
      </svg>
      <svg className="absolute bottom-32 right-16 w-20 h-20 text-emerald-600 opacity-30" viewBox="0 0 100 100">
        <path d="M20 80 L 40 40 L 60 70 L 80 30" stroke="currentColor" strokeWidth="3" fill="none"/>
      </svg>

      <div className="w-full max-w-6xl flex items-center justify-between gap-8 relative z-10">
        {/* Left Side - Image Section */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative">
          <div className="relative">
            {/* Decorative patterns */}
            <div className="absolute -top-8 -left-8 w-64 h-64 border-2 border-green-300 rounded-full opacity-20"></div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 border-2 border-emerald-300 rounded-full opacity-20"></div>
            
            {/* Food Images Placeholder */}
            <div className="relative bg-gradient-to-br from-green-400 to-emerald-600 rounded-full w-96 h-96 flex items-center justify-center shadow-2xl">
              <div className="text-white text-center p-8">
                <Leaf className="w-24 h-24 mx-auto mb-4 opacity-90" />
                <h2 className="text-3xl font-bold mb-2">Fresh & Healthy</h2>
                <p className="text-lg opacity-90">Track your nutrition journey</p>
              </div>
            </div>
          </div>
          
          {/* Decorative squiggly lines */}
          <svg className="absolute -top-12 right-20 w-32 h-32 text-green-400 opacity-50" viewBox="0 0 200 200">
            <path d="M50 100 Q 75 50, 100 100 T 150 100" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path d="M60 120 Q 85 70, 110 120 T 160 120" stroke="currentColor" strokeWidth="4" fill="none"/>
          </svg>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 max-w-md">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-green-100">
            {/* App Name */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Leaf className="w-8 h-8 text-green-600" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-green-500 via-emerald-600 to-green-700 bg-clip-text text-transparent">
                  Dietly
                </h1>
              </div>
              <p className="text-gray-600 text-lg">Welcome back!</p>
              <p className="text-gray-500 text-sm">Login to continue your healthy journey</p>
            </div>

            {/* Login Form */}
            <div className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email / Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-green-400 outline-none transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-green-400 outline-none transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">Remember me</span>
                </label>
                <button
                  onClick={() => console.log('Forgot password clicked')}
                  className="text-sm text-green-600 hover:text-green-700 font-semibold transition"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Login
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleGoogleLogin}
                className="flex-1 flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                onClick={() => console.log('Facebook login clicked')}
                className="flex-1 flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <button
                onClick={() => console.log('Create account clicked')}
                className="text-green-600 hover:text-green-700 font-bold transition"
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}