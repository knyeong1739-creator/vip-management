import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, AlignLeft, Send, Sparkles, ImagePlus, Trash2 } from 'lucide-react';
import { OutreachEvent } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: Omit<OutreachEvent, 'id' | 'created_at'>) => void;
  onUpdateEvent?: (event: OutreachEvent) => void;
  eventToEdit?: OutreachEvent | null;
}

export default function EventModal({ isOpen, onClose, onAddEvent, onUpdateEvent, eventToEdit }: EventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
    poster_image: '' as string | undefined
  });
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title,
        date: eventToEdit.date,
        location: eventToEdit.location,
        description: eventToEdit.description,
        poster_image: eventToEdit.poster_image
      });
      setPosterPreview(eventToEdit.poster_image || null);
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        description: '',
        poster_image: undefined
      });
      setPosterPreview(null);
    }
  }, [eventToEdit, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData(prev => ({ ...prev, poster_image: base64 }));
      setPosterPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePoster = () => {
    setFormData(prev => ({ ...prev, poster_image: undefined }));
    setPosterPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventToEdit && onUpdateEvent) {
      onUpdateEvent({ ...eventToEdit, ...formData });
    } else {
      onAddEvent(formData);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-blue-950/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(29,78,216,0.15)] overflow-hidden overflow-y-auto max-h-[90vh] border border-blue-50"
          >
            <div className="p-10 pb-6 flex justify-between items-start">
              <div>
                <h2 className="font-black text-3xl mb-2 flex items-center gap-3 text-blue-950 uppercase tracking-tight">
                  <Sparkles size={28} className="text-blue-700" />
                  {eventToEdit ? '행사 일정 수정' : '행사 일정 등록'}
                </h2>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-600/50">
                  {eventToEdit ? 'Modify Existing Event' : 'Add Upcoming VIP Outreach Event'}
                </p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-blue-50 text-blue-300 hover:text-blue-700 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 pt-4 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-2">
                  <Sparkles size={14} className="text-blue-400" /> 행사명
                </label>
                <input
                  required
                  type="text"
                  placeholder="예: 2024 글로벌 융합 포럼"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 ring-blue-700/10 border border-blue-100 focus:border-blue-700 transition-all font-bold text-blue-900 placeholder:text-blue-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-2">
                    <Calendar size={14} className="text-blue-400" /> 일시
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 ring-blue-700/10 border border-blue-100 focus:border-blue-700 transition-all font-bold text-blue-900"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-2">
                    <MapPin size={14} className="text-blue-400" /> 장소
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="행사 장소"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 ring-blue-700/10 border border-blue-100 focus:border-blue-700 transition-all font-bold text-blue-900 placeholder:text-blue-200"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-2">
                  <AlignLeft size={14} className="text-blue-400" /> 행사 상세 설명
                </label>
                <textarea
                  placeholder="참석 예정 VIP 명단이나 행사 개요를 작성하세요"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-5 bg-blue-50/50 rounded-2xl outline-none focus:ring-2 ring-blue-700/10 border border-blue-100 focus:border-blue-700 transition-all min-h-[140px] resize-none font-bold text-blue-900 placeholder:text-blue-200 leading-relaxed shadow-inner"
                />
              </div>

              {/* 포스터 업로드 */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 flex items-center gap-2">
                  <ImagePlus size={14} className="text-blue-400" /> 행사 포스터 (선택)
                </label>

                {posterPreview ? (
                  <div className="relative group rounded-2xl overflow-hidden border border-blue-100">
                    <img src={posterPreview} alt="포스터 미리보기" className="w-full max-h-60 object-cover" />
                    <button
                      type="button"
                      onClick={handleRemovePoster}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-8 border-2 border-dashed border-blue-100 rounded-2xl flex flex-col items-center gap-3 hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-all">
                      <ImagePlus size={22} className="text-blue-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-blue-400 uppercase tracking-widest">클릭하여 포스터 업로드</p>
                      <p className="text-[10px] text-blue-200 font-bold mt-1">JPG, PNG, WEBP 지원</p>
                    </div>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full p-5 bg-blue-700 text-white rounded-[1.25rem] font-black text-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-4 shadow-xl shadow-blue-200 uppercase tracking-widest mt-4"
              >
                <Send size={22} className="text-blue-200" /> 일정 확정하기
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}