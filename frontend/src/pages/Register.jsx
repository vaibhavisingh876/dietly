import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../api/api';

export default function DietlyRegister() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Frontend validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      // Send only backend-compatible fields
      await api.post('/auth/register', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        country: formData.country || "" // optional
      });

      console.log('✅ Registration successful');
      navigate('/login?registered=true');

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Check if the email is already in use.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    setError(`${provider} login is not yet implemented.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 flex overflow-y-auto">
      <div className="w-full flex">
        {/* Left Side - Branding */}
        <div className="flex-1 flex flex-col justify-center px-12 lg:px-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-green-500 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                Dietly
              </span>
            </div>

            <h1 className="text-5xl font-bold text-gray-800 leading-tight mb-6">
              Your Personal Meal Companion
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              Dietly makes healthy eating effortless. Get AI-powered insights on your meals.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-lg shadow-sm">
                <Sparkles className="w-5 h-5 text-teal-500" />
                <span className="text-sm font-medium text-gray-700">AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-lg shadow-sm">
                <Leaf className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Smart Nutrition</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col justify-center px-12 py-16">
          <div className="w-full space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
              <p className="text-gray-600 mt-2">Start your healthy eating journey today</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl font-medium">
                <AlertTriangle className='w-5 h-5 flex-shrink-0' />
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <div className="space-y-4">
              {/* Name (Frontend only) */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                  placeholder="John Doe" disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="you@example.com" disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} id="password" name="password"
                    value={formData.password} onChange={handleChange} disabled={loading}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all pr-12"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Frontend only) */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword"
                    value={formData.confirmPassword} onChange={handleChange} disabled={loading}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all pr-12"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold py-3 px-4 rounded-xl hover:from-teal-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Registering...</>) : 'Create Account'}
              </button>
            </div>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
                Login here
              </a>
            </p>

            <p className="text-center text-xs text-gray-500 pt-2">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
