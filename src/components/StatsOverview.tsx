import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Calendar, Award, MapPin, Clock, Copy, Check, ZoomIn, X } from 'lucide-react';
import { VIPEntry, OutreachEvent } from '../types';
import { cn } from '../lib/utils';

interface StatsOverviewProps {
  entries: VIPEntry[];
  upcomingEvents: OutreachEvent[];
}

export default function StatsOverview({ entries, upcomingEvents }: StatsOverviewProps) {
  const [copied, setCopied] = useState(false);
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [posterTarget, setPosterTarget] = useState<OutreachEvent | null>(null);

  const upcomingEvent = upcomingEvents[0];

  const handleCopyMessage = () => {
    if (!upcomingEvent) return;
    const message = `[대외선교부 행사 공지]
📌 행사명: ${upcomingEvent.title}
📅 일시: ${upcomingEvent.date}
📍 장소: ${upcomingEvent.location}
📝 참여VIP: ${upcomingEvent.description}`;
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentYear = new Date().getFullYear();
  const yearEntries = entries.filter(e => new Date(e.date).getFullYear() === currentYear);
  const monthEntries = entries.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === currentYear && d.getMonth() === new Date().getMonth();
  });

  const categoryCounts = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    { label: '올해의 VIP 전도 횟수', value: yearEntries.length, icon: Award, color: 'bg-blue-700 text-white shadow-lg shadow-blue-200' },
    { label: '이번 달 신규 전도', value: monthEntries.length, icon: Users, color: 'bg-white text-blue-900 border-blue-50 shadow-sm' },
    { label: '전체 VIP 명단', value: entries.length, icon: Users, color: 'bg-white text-blue-900 border-blue-50 shadow-sm' },
    { label: '예정된 행사 수', value: upcomingEvents.length, icon: Calendar, color: 'bg-white text-blue-900 border-blue-50 shadow-sm' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-7 rounded-3xl border flex flex-col justify-between h-40 transition-all hover:-translate-y-1",
              stat.color
            )}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-60">{stat.label}</span>
              <stat.icon size={20} className={cn(stat.color.includes('bg-blue-700') ? "text-white/50" : "text-blue-500/50")} />
            </div>
            <div className="text-4xl font-black tracking-tighter">
              {stat.value}
              <span className="text-sm font-bold ml-1 opacity-50 uppercase">명 / 회</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 예정된 행사 목록 */}
        <div className="bg-white rounded-3xl border border-blue-50 p-8 shadow-[0_10px_30px_rgba(29,78,216,0.04)]">
          <h3 className="font-black text-xl mb-6 flex items-center gap-2 text-blue-950 uppercase tracking-tight">
            <Calendar size={22} className="text-blue-700" /> 예정된 주요 행사
          </h3>

          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((event, i) => (
                <div
                  key={event.id}
                  className="p-4 bg-blue-50/50 rounded-2xl border-l-[6px] border-blue-700 relative group/item"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-blue-900 text-sm mb-2 truncate">{event.title}</h4>
                      <div className="space-y-1 font-bold">
                        <p className="text-[10px] text-blue-600/70 flex items-center gap-2 uppercase tracking-wide">
                          <Clock size={11} className="text-blue-400 shrink-0" /> {event.date}
                        </p>
                        <p className="text-[10px] text-blue-600/70 flex items-center gap-2 uppercase tracking-wide">
                          <MapPin size={11} className="text-blue-400 shrink-0" /> {event.location}
                        </p>
                      </div>
                    </div>
                    {event.poster_image && (
                      <button
                        onClick={() => { setPosterTarget(event); setIsPosterOpen(true); }}
                        className="p-2 bg-white rounded-xl shadow-sm border border-blue-100 text-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all shrink-0"
                        title="포스터 보기"
                      >
                        <ZoomIn size={14} />
                      </button>
                    )}
                  </div>

                  {i === 0 && (
                    <button
                      onClick={handleCopyMessage}
                      className="absolute top-2 right-2 p-2 bg-white rounded-xl shadow-md opacity-0 group-hover/item:opacity-100 transition-all hover:bg-blue-50 text-blue-700 border border-blue-100"
                      title="공지 복사"
                    >
                      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={handleCopyMessage}
                className="w-full py-4 bg-blue-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest mt-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? '복사되었습니다!' : '공지용 텍스트 복사'}
              </button>
            </div>
          ) : (
            <div className="py-12 text-center bg-blue-50/30 rounded-2xl border-2 border-dashed border-blue-100">
              <p className="text-[10px] text-blue-300 font-black uppercase tracking-[0.3em]">No Events Scheduled</p>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-blue-50 p-8 shadow-[0_10px_30px_rgba(29,78,216,0.04)]">
          <h3 className="font-black text-xl mb-8 flex items-center gap-2 text-blue-950 uppercase tracking-tight">
            <Award size={22} className="text-blue-700" /> VIP 분야별 분포
          </h3>
          <div className="space-y-8">
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <div key={cat} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="font-black text-blue-900 text-xs uppercase tracking-wide">{cat}</span>
                  <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {count}명 ({(count / entries.length * 100 || 0).toFixed(1)}%)
                  </span>
                </div>
                <div className="h-3 bg-blue-50 rounded-full overflow-hidden border border-blue-100/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / entries.length * 100 || 0)}%` }}
                    className="h-full bg-blue-700 rounded-full shadow-[0_0_10px_rgba(29,78,216,0.2)]"
                  />
                </div>
              </div>
            ))}
            {entries.length === 0 && (
              <div className="py-20 text-center">
                <Users size={40} className="mx-auto text-blue-100 mb-4" />
                <p className="text-sm font-bold text-blue-200 italic uppercase tracking-widest">데이터가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-blue-950 text-white rounded-3xl p-10 shadow-2xl relative overflow-hidden border border-blue-800">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="font-black text-xl mb-6 uppercase tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-500 rounded-full" /> 대외선교부 지침
            </h3>
            <ul className="space-y-5 text-sm font-bold list-none">
              {[
                'VIP와의 만남 후 최대한 빨리 내용을 기록합니다.',
                '진행 상황은 구체적으로 서술합니다.',
                '개인정보 보안에 유의합니다.',
                'VIP 분류가 애매할 경우 문의 부탁드립니다!'
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 opacity-90">
                  <span className="w-5 h-5 bg-blue-700 rounded-full flex items-center justify-center text-[10px] shrink-0">{i + 1}</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-end items-end text-right">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-blue-400 mb-4">Internal Management Tool</p>
            <p className="font-black text-3xl leading-tight opacity-50 uppercase tracking-tighter">Success through<br />Consistency</p>
          </div>
        </div>
        <Users size={160} className="absolute -bottom-10 -right-10 text-blue-400/10" />
      </div>

      {/* 포스터 팝업 */}
      <AnimatePresence>
        {isPosterOpen && posterTarget?.poster_image && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsPosterOpen(false); setPosterTarget(null); }}
              className="absolute inset-0 bg-blue-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-blue-50"
            >
              <div className="p-5 flex items-center justify-between border-b border-blue-50">
                <div>
                  <h3 className="font-black text-blue-950 text-sm uppercase tracking-tight">{posterTarget.title}</h3>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">
                    {posterTarget.date} · {posterTarget.location}
                  </p>
                </div>
                <button
                  onClick={() => { setIsPosterOpen(false); setPosterTarget(null); }}
                  className="p-2 hover:bg-blue-50 text-blue-300 hover:text-blue-700 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <img
                src={posterTarget.poster_image}
                alt={`${posterTarget.title} 포스터`}
                className="w-full max-h-[70vh] object-contain bg-blue-50/30"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}