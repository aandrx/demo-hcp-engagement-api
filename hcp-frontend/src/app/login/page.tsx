'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight, Stethoscope } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/proxy/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth data
        localStorage.setItem('authToken', data.access_token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.group('🚨 LOGIN ERROR - API DEBUG INFO');
      console.error('❌ Error Type:', error.constructor.name);
      console.error('❌ Error Name:', error.name);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Full Error Object:', error);
      console.error('❌ Stack Trace:', error.stack);
      console.error('❌ Request URL:', 'http://localhost:5001/auth/login');
      console.error('❌ Request Method:', 'POST');
      console.error('❌ Request Headers:', {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      });
      console.error('❌ Request Body:', { username, password: '***' });
      console.error('❌ Current URL:', window.location.href);
      console.error('❌ User Agent:', navigator.userAgent);
      console.error('❌ Timestamp:', new Date().toISOString());
      
         // Check if API is reachable
         fetch('/api/proxy/health')
        .then(response => {
          console.log('✅ API Health Check Response:', response.status, response.statusText);
          return response.json();
        })
        .then(data => {
          console.log('✅ API Health Data:', data);
        })
        .catch(healthError => {
          console.error('❌ API Health Check Failed:', healthError);
          console.error('❌ This means the API is not running or not accessible');
        });
      
      console.groupEnd();
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setError('CORS Error: API is running but CORS is blocking the request. Check browser console for full debug info.');
      } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        setError('Network Error: Cannot connect to API. Check console for API health status.');
      } else {
        setError(`Connection error: ${error.message || 'Unknown error'}. Check console for details.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            HCP Engagement Platform
          </h1>
          <p className="text-gray-600">
            Healthcare Provider Analytics & Literature Search
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Demo Credentials</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Provider:</span> demo_provider / demo123
              </div>
              <div>
                <span className="font-medium">Admin:</span> demo_admin / admin123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
