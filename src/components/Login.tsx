import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { LoginState, UserProfile } from '../types';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
  error: string | null;
}

export default function Login({ onLogin, error }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onLogin(username, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-blue-950 font-sans relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-full h-full bg-blue-600/[0.02] transform -skew-y-12 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-2xl shadow-[0_20px_50px_rgba(29,78,216,0.1)] border border-blue-50 relative z-10"
      >
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-blue-200">
             <LogIn size={32} />
          </div>
          <h1 className="font-black text-2xl mb-2 uppercase tracking-tight">대외선교부 VIP 관리 시스템</h1>
          <p className="text-[10px] text-blue-600/60 uppercase tracking-[0.2em] font-black">Sign In to Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-2">
              <User size={12} /> 이름 (이름/관리자)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 bg-blue-50/50 border border-blue-100 focus:border-blue-700 rounded-xl transition-all outline-none font-bold text-blue-900 placeholder:text-blue-200"
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-2">
              <Lock size={12} /> 비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-blue-50/50 border border-blue-100 focus:border-blue-700 rounded-xl transition-all outline-none font-bold text-blue-900 placeholder:text-blue-200"
              placeholder="••••••••"
              required
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-red-600 text-[13px] bg-red-50 p-4 rounded-xl border border-red-100 font-bold"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 bg-blue-700 text-white rounded-xl font-black text-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            {loading ? '로그인 중...' : <><LogIn size={20} /> 로그인</>}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-blue-50 text-center text-[9px] uppercase tracking-[0.3em] font-black text-blue-900/30">
          시스템 관리: IUBA 경상대센터 대외선교부 
        </div>
      </motion.div>
    </div>
  );
}
