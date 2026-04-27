import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PasswordChangeProps {
  onPasswordChange: (newPassword: string) => Promise<void>;
  error: string | null;
}

export default function PasswordChange({ onPasswordChange, error }: PasswordChangeProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    setLoading(true);
    await onPasswordChange(newPassword);
    setLoading(false);
  };

  const passwordsMatch = newPassword === confirmPassword && newPassword !== '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E4E3E0] p-4 text-[#141414] font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl border border-[#141414]/10"
      >
        <div className="mb-8 text-center">
          <h1 className="font-serif italic text-2xl mb-2">비밀번호 변경</h1>
          <p className="text-sm opacity-60">최초 로그인 시 비밀번호를 변경해야 합니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider font-mono opacity-60">새 비밀번호</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-4 bg-[#f5f5f5] rounded-lg outline-none border border-transparent focus:border-[#141414]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider font-mono opacity-60">비밀번호 확인</label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 bg-[#f5f5f5] rounded-lg outline-none border border-transparent focus:border-[#141414]"
                required
              />
              {passwordsMatch && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                  <CheckCircle2 size={18} />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !passwordsMatch}
            className="w-full p-4 bg-[#141414] text-white rounded-lg font-serif italic text-lg hover:opacity-90 disabled:opacity-30 transition-all"
          >
            {loading ? '변경 중...' : '비밀번호 변경 완료'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
