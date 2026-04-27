import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, MapPin, Clock, Pencil, Trash2,
  ZoomIn, X, Send, ImagePlus, AlignLeft, Sparkles
} from 'lucide-react';
import { OutreachEvent } from '../types';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface EventListProps {
  events: OutreachEvent[];
  onAddEvent: (event: Omit<OutreachEvent, 'id' | 'created_at'>) => void;
  onUpdateEvent: (event: OutreachEvent) => void;
  onDeleteEvent: (id: string) => Promise<void>;
  }

type SubTab = 'browse' | 'edit';

export default function EventList({ events, onAddEvent, onUpdateEvent, onDeleteEvent }: EventListProps) {
  const [subTab, setSubTab] = useState<SubTab>('browse');
  const [selectedEvent, setSelectedEvent] = useState<OutreachEvent | null>(null);
  const [posterTarget, setPosterTarget] = useState<OutreachEvent | null>(null);
  const [isPosterOpen, setIsPosterOpen] = useState(false);

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const upcoming = sorted.filter(e => new Date(e.date) >= today);
  const past = sorted.filter(e => new Date(e.date) < today).reverse();

  const handleSelectForEdit = (event: OutreachEvent) => {
    setSelectedEvent({ ...event });
    setSubTab('edit');
  };

  const handleDelete = async (event: OutreachEvent) => {
    if (!confirm(`"${event.title}" 행사를 삭제하시겠습니까?`)) return;
    await onDeleteEvent(event.id);
  };

  const EventCard = ({ event }: { event: OutreachEvent }) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-blue-50 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex flex-col items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl text-blue-700 font-black text-[11px] shrink-0 border border-blue-100 group-hover:bg-blue-700 group-hover:text-white transition-all duration-300">
        <Calendar size={16} className="mb-1" />
        {event.date.split('-').slice(1).join('/')}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-black text-blue-950 text-base tracking-tight truncate">{event.title}</h4>
        <div className="flex items-center gap-4 mt-1">
          <p className="text-[10px] text-blue-600/60 font-bold flex items-center gap-1 uppercase tracking-wide">
            <MapPin size={10} className="text-blue-300" /> {event.location}
          </p>
        </div>
        {event.description && (
          <p className="text-[11px] text-blue-900/40 font-bold mt-1 truncate italic">{event.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {event.poster_image && (
          <button
            onClick={() => { setPosterTarget(event); setIsPosterOpen(true); }}
            className="p-2.5 bg-blue-50 text-blue-400 hover:text-blue-700 hover:bg-blue-100 rounded-xl transition-all border border-blue-100"
            title="포스터 보기"
          >
            <ZoomIn size={16} />
          </button>
        )}
        <button
          onClick={() => handleSelectForEdit(event)}
          className="p-2.5 bg-blue-50 text-blue-400 hover:text-blue-700 hover:bg-blue-100 rounded-xl transition-all border border-blue-100"
          title="수정"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => handleDelete(event)}
          className="p-2.5 bg-red-50 text-red-300 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all border border-red-100"
          title="삭제"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* 서브탭 */}
      <div className="flex rounded-2xl overflow-hidden border border-blue-100 p-1 bg-blue-50/50 w-fit">
        {([['browse', '목록'], ['edit', '수정']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={cn(
              "px-8 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
              subTab === id ? "bg-blue-700 text-white shadow-md shadow-blue-200" : "text-blue-600/50 hover:text-blue-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 찾기 탭 */}
      <AnimatePresence mode="wait">
        {subTab === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-8"
          >
            {/* 다가오는 행사 */}
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> 다가오는 행사 ({upcoming.length})
              </h3>
              {upcoming.length > 0 ? (
                <div className="space-y-3">
                  {upcoming.map(e => <EventCard key={e.id} event={e} />)}
                </div>
              ) : (
                <div className="py-10 text-center bg-white rounded-2xl border-2 border-dashed border-blue-100">
                  <p className="text-[10px] text-blue-200 font-black uppercase tracking-[0.3em]">예정된 행사가 없습니다</p>
                </div>
              )}
            </div>

            {/* 지난 행사 */}
            {past.length > 0 && (
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest text-blue-200 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-200 rounded-full" /> 지난 행사 ({past.length})
                </h3>
                <div className="space-y-3 opacity-60">
                  {past.map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 수정 탭 */}
        {subTab === 'edit' && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* 행사 선택 목록 */}
            <div className="bg-white rounded-3xl border border-blue-50 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-blue-50">
                <h3 className="font-black text-sm uppercase tracking-widest text-blue-950">수정할 행사 선택</h3>
              </div>
              <div className="overflow-y-auto max-h-[60vh]">
                {sorted.map(event => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent({ ...event })}
                    className={cn(
                      "w-full p-5 flex items-center gap-4 border-b border-blue-50/50 last:border-0 transition-all text-left group",
                      selectedEvent?.id === event.id ? "bg-blue-700" : "hover:bg-blue-50/50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-black transition-all",
                      selectedEvent?.id === event.id ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600 border border-blue-100"
                    )}>
                      <Calendar size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-black text-sm truncate", selectedEvent?.id === event.id ? "text-white" : "text-blue-950")}>{event.title}</p>
                      <p className={cn("text-[10px] font-bold uppercase tracking-wide", selectedEvent?.id === event.id ? "text-blue-200" : "text-blue-400")}>{event.date} · {event.location}</p>
                    </div>
                  </button>
                ))}
                {sorted.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-[10px] text-blue-200 font-black uppercase tracking-[0.3em]">행사가 없습니다</p>
                  </div>
                )}
              </div>
            </div>

            {/* 수정 폼 */}
            <div className="bg-white rounded-3xl border border-blue-50 shadow-sm">
              {selectedEvent ? (
                <EditForm
                  event={selectedEvent}
                  onChange={setSelectedEvent}
                  onSubmit={() => {
                    onUpdateEvent(selectedEvent);
                    setSubTab('browse');
                  }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-24 text-center px-8">
                  <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mb-4">
                    <Pencil size={28} className="text-blue-200" />
                  </div>
                  <p className="font-black text-blue-200 text-sm uppercase tracking-widest">왼쪽에서 행사를 선택하세요</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 포스터 팝업 */}
      <AnimatePresence>
        {isPosterOpen && posterTarget?.poster_image && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPosterOpen(false)}
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
                <button onClick={() => setIsPosterOpen(false)} className="p-2 hover:bg-blue-50 text-blue-300 hover:text-blue-700 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
              <img src={posterTarget.poster_image} alt={posterTarget.title} className="w-full max-h-[70vh] object-contain bg-blue-50/30" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 인라인 수정 폼
function EditForm({
  event,
  onChange,
  onSubmit
}: {
  event: OutreachEvent;
  onChange: (e: OutreachEvent) => void;
  onSubmit: () => void;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange({ ...event, poster_image: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
      <div>
        <h3 className="font-black text-sm uppercase tracking-widest text-blue-950 mb-1 flex items-center gap-2">
          <Sparkles size={16} className="text-blue-700" /> 행사 수정
        </h3>
        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{event.title}</p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40">행사명</label>
        <input
          type="text"
          value={event.title}
          onChange={e => onChange({ ...event, title: e.target.value })}
          className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none border border-blue-100 focus:border-blue-700 font-bold text-blue-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-1">
            <Calendar size={12} className="text-blue-400" /> 날짜
          </label>
          <input
            type="date"
            value={event.date}
            onChange={e => onChange({ ...event, date: e.target.value })}
            className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none border border-blue-100 focus:border-blue-700 font-bold text-blue-900"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-1">
            <MapPin size={12} className="text-blue-400" /> 장소
          </label>
          <input
            type="text"
            value={event.location}
            onChange={e => onChange({ ...event, location: e.target.value })}
            className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none border border-blue-100 focus:border-blue-700 font-bold text-blue-900"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-1">
          <AlignLeft size={12} className="text-blue-400" /> 상세 설명
        </label>
        <textarea
          value={event.description}
          onChange={e => onChange({ ...event, description: e.target.value })}
          className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none border border-blue-100 focus:border-blue-700 font-bold text-blue-900 min-h-[100px] resize-none"
        />
      </div>

      {/* 포스터 */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-1">
          <ImagePlus size={12} className="text-blue-400" /> 포스터
        </label>
        {event.poster_image ? (
          <div className="relative group rounded-2xl overflow-hidden border border-blue-100">
            <img src={event.poster_image} alt="포스터" className="w-full max-h-40 object-cover" />
            <button
              type="button"
              onClick={() => onChange({ ...event, poster_image: undefined })}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-6 border-2 border-dashed border-blue-100 rounded-2xl flex items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/30 transition-all"
          >
            <ImagePlus size={18} className="text-blue-300" />
            <span className="text-xs font-black text-blue-300 uppercase tracking-widest">포스터 업로드</span>
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      </div>

      <button
        onClick={onSubmit}
        className="w-full p-4 bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100"
      >
        <Send size={18} className="text-blue-200" /> 수정 완료
      </button>
    </div>
  );
}