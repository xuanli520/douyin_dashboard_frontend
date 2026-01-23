'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import loginBg from '@/assets/login.png';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual authentication logic here
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-30">
        <img src={loginBg.src} alt="" className="w-full h-full object-cover" />
      </div>
      
      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1a3a6b] mb-2">猪鱼</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Log In
          </button>

          <div className="flex justify-between text-sm text-gray-600 pt-2">
            <button type="button" className="hover:text-blue-600 transition-colors">
              Forgot Password?
            </button>
            <button type="button" className="hover:text-blue-600 transition-colors">
              Help
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}