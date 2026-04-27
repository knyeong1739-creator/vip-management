import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Calendar, User, Briefcase, Phone, FileText, MapPin } from 'lucide-react';
import { VIPCategory, Affiliation, VIPEntry } from '../types';

interface VIPEntryFormProps {
  onAddEntry: (entry: Omit<VIPEntry, 'id' | 'created_at'>) => Promise<void>;
  onComplete: () => void;
}

export default function VIPEntryForm({ onAddEntry, onComplete }: VIPEntryFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    affiliation: '',
    name: '',
    position: '',
    category: '금융·기업·단체' as VIPCategory,
    contact: '',
    progress: '',
  });

  const [loading, setLoading] = useState(false);

  const categories: VIPCategory[] = [
    '금융·기업·단체',
    '교육·문학·언론',
    '정치·법조·공직·경찰'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAddEntry(formData);
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-blue-50 p-10 shadow-[0_20px_50px_rgba(29,78,216,0.05)] max-w-3xl mx-auto">
      <div className="mb-10 border-b border-blue-50 pb-8">
        <h2 className="font-black text-2xl mb-2 text-blue-950 uppercase tracking-tight">VIP 전도 기록</h2>
        <p className="text-[10px] text-blue-600/50 uppercase tracking-[0.2em] font-black">Input System Registry</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Date */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-2">
              <Calendar size={14} className="text-blue-400" /> 날짜
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 ring-blue-700/10 border border-blue-100 focus:border-blue-700 transition-all font-bold text-blue-900"
            />
          </div>

          {/* Affiliation */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-2">
              <MapPin size={14} className="text-blue-400" /> 소속
            </label>
            <input
              type="text"
              required
              placeholder="예: 경상국립대학교, 삼성전자 등"
              value={formData.affiliation}
              onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
              className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 ring-blue-700/10 border border-blue-100 focus:border-blue-700 transition-all font-bold text-blue-900 placeholder:text-blue-200"
            />
          </div>

          {/* Name */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-2">
              <User size={14} className="text-blue-400" /> 이름
            </label>
            <input
              type="text"
              required
              placeholder="VIP 성함"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 ring-blue-700/10 border border-blue-100 focus:border-blue-700 transition-all font-bold text-blue-900 placeholder:text-blue-200"
            />
          </div>

          {/* Position */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-2">
              <Briefcase size={14} className="text-blue-400" /> 직책
            </label>
            <input
              type="text"
              required
              placeholder="예: 대표, 교수, 국회의원 등"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 ring-blue-700/10 border border-blue-100 focus:border-blue-700 transition-all font-bold text-blue-900 placeholder:text-blue-200"
            />
          </div>

          {/* Category */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-2">
              <FileText size={14} className="text-blue-400" /> 분야
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as VIPCategory })}
              className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 ring-blue-700/10 border border-blue-100 focus:border-blue-700 transition-all font-bold text-blue-900 appearance-none cursor-pointer"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-2">
              <Phone size={14} className="text-blue-400" /> 연락처
            </label>
            <input
              type="tel"
              required
              placeholder="010-0000-0000"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 ring-blue-700/10 border border-blue-100 focus:border-blue-700 transition-all font-bold text-blue-900 placeholder:text-blue-200"
            />
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-2">
              <FileText size={14} className="text-blue-400" /> 진행도 / 상세 기록
            </label>
            <textarea
              required
              placeholder="만남의 배경, 대화 내용, 향후 일정 등을 자유롭게 서술하세요"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
              className="w-full p-6 bg-blue-50/50 rounded-3xl outline-none focus:ring-2 ring-blue-700/10 border border-blue-100 focus:border-blue-700 min-h-[180px] resize-none leading-relaxed font-bold text-blue-900 placeholder:text-blue-200 shadow-inner"
            />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-5 bg-blue-700 text-white rounded-2xl font-black text-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-4 disabled:opacity-50 mt-6 shadow-xl shadow-blue-200 uppercase tracking-widest"
        >
          {loading ? '기록 중...' : <><Send size={22} className="text-blue-200" /> 정보 등록하기</>}
        </button>
      </form>
    </div>
  );
}

function Tag({ size, className }: { size: number, className?: string }) {
    return <FileText size={size} className={className} />;
}
