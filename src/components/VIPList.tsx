import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  FileText,
  File as FilePdf,
  ChevronRight,
  ChevronDown,
  Trash2,
  Calendar,
  Filter,
  User,
  Users,
  Briefcase,
  Sparkles,
  Pencil,
  X,
  Save
} from 'lucide-react';
import { VIPEntry, VIPCategory } from '../types';
import { cn, formatDate } from '../lib/utils';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface VIPListProps {
  entries: VIPEntry[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, entry: Omit<VIPEntry, 'id' | 'created_at'>) => Promise<void>;
  canEdit: boolean;
}

export default function VIPList({ entries, onDelete, onUpdate, canEdit }: VIPListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [groupType, setGroupType] = useState<'yearly' | 'monthly' | 'category'>('yearly');
  const [filterValue, setFilterValue] = useState<string>('all');
  const [editingEntry, setEditingEntry] = useState<VIPEntry | null>(null);
  const [editForm, setEditForm] = useState<Omit<VIPEntry, 'id' | 'created_at'>>({
    date: '',
    affiliation: '',
    name: '',
    position: '',
    category: '금융·기업·단체',
    contact: '',
    progress: '',
  });
  const [editLoading, setEditLoading] = useState(false);

  const categories: VIPCategory[] = ['금융·기업·단체', '교육·문학·언론', '정치·법조·공직·경찰'];

  const groupedData = useMemo(() => {
    const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (filterValue !== 'all') {
      if (groupType === 'yearly') return sorted.filter(e => new Date(e.date).getFullYear().toString() === filterValue);
      if (groupType === 'monthly') return sorted.filter(e => {
        const d = new Date(e.date);
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}` === filterValue;
      });
      if (groupType === 'category') return sorted.filter(e => e.category === filterValue);
    }
    return sorted;
  }, [entries, groupType, filterValue]);

  const filterOptions = useMemo(() => {
    if (groupType === 'yearly') {
      const years = Array.from(new Set(entries.map(e => new Date(e.date).getFullYear()))).sort((a, b) => b - a);
      return years.map(y => ({ label: `${y}년`, value: y.toString() }));
    }
    if (groupType === 'monthly') {
      const months = Array.from(new Set(entries.map(e => {
        const d = new Date(e.date);
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      }))).sort((a, b) => b.localeCompare(a));
      return months.map(m => ({ label: m, value: m }));
    }
    if (groupType === 'category') {
      const cats: VIPCategory[] = ['금융·기업·단체', '교육·문학·언론', '정치·법조·공직·경찰'];
      return cats.map(c => ({ label: c, value: c }));
    }
    return [];
  }, [entries, groupType]);

  const handleEditClick = (e: React.MouseEvent, entry: VIPEntry) => {
    e.stopPropagation();
    setEditingEntry(entry);
    setEditForm({
      date: entry.date,
      affiliation: entry.affiliation,
      name: entry.name,
      position: entry.position,
      category: entry.category,
      contact: entry.contact,
      progress: entry.progress,
    });
  };

  const handleEditSave = async () => {
    if (!editingEntry) return;
    setEditLoading(true);
    try {
      await onUpdate(editingEntry.id, editForm);
      setEditingEntry(null);
    } catch (err) {
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(groupedData.map(e => ({
      '날짜': e.date,
      '소속': e.affiliation,
      '이름': e.name,
      '직책': e.position,
      '분야': e.category,
      '연락처': e.contact,
      '진행도': e.progress
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "VIP_List");
    XLSX.writeFile(wb, `VIP명단_${groupType === 'yearly' ? '연도별' : groupType === 'monthly' ? '월별' : '분야별'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: `VIP 명단 (${groupType})`, bold: true, size: 32 })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: ['날짜', '이름', '직책', '소속', '분야'].map(h => new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })]
                }))
              }),
              ...groupedData.map(e => new TableRow({
                children: [e.date, e.name, e.position, e.affiliation, e.category].map(t => new TableCell({
                  children: [new Paragraph({ text: t })]
                }))
              }))
            ]
          })
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `VIP명단_${groupType === 'yearly' ? '연도별' : groupType === 'monthly' ? '월별' : '분야별'}_${new Date().toISOString().split('T')[0]}.docx`);
  };

  const exportToPdf = () => {
    const doc = new jsPDF();
    doc.text(`VIP List - ${groupType}`, 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Date', 'Name', 'Position', 'Affiliation', 'Category', 'Contact']],
      body: groupedData.map(e => [e.date, e.name, e.position, e.affiliation, e.category, e.contact]),
      styles: { font: 'helvetica', fontSize: 8 },
    });
    doc.save(`VIP명단_${groupType === 'yearly' ? '연도별' : groupType === 'monthly' ? '월별' : '분야별'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Edit Modal */}
      <AnimatePresence>
        {editingEntry && (
          <div className="fixed inset-0 bg-blue-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-xl text-blue-950 uppercase tracking-tight">VIP 정보 수정</h3>
                <button onClick={() => setEditingEntry(null)} className="p-2 hover:bg-blue-50 rounded-xl transition-all">
                  <X size={20} className="text-blue-300" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40">날짜</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl outline-none focus:border-blue-700 font-bold text-blue-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40">소속</label>
                  <input
                    type="text"
                    value={editForm.affiliation}
                    onChange={e => setEditForm({ ...editForm, affiliation: e.target.value })}
                    className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl outline-none focus:border-blue-700 font-bold text-blue-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40">이름</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl outline-none focus:border-blue-700 font-bold text-blue-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40">직책</label>
                  <input
                    type="text"
                    value={editForm.position}
                    onChange={e => setEditForm({ ...editForm, position: e.target.value })}
                    className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl outline-none focus:border-blue-700 font-bold text-blue-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40">분야</label>
                  <select
                    value={editForm.category}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value as VIPCategory })}
                    className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl outline-none focus:border-blue-700 font-bold text-blue-900 appearance-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40">연락처</label>
                  <input
                    type="tel"
                    value={editForm.contact}
                    onChange={e => setEditForm({ ...editForm, contact: e.target.value })}
                    className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl outline-none focus:border-blue-700 font-bold text-blue-900"
                  />
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40">진행도 / 상세 기록</label>
                <textarea
                  value={editForm.progress}
                  onChange={e => setEditForm({ ...editForm, progress: e.target.value })}
                  className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl outline-none focus:border-blue-700 font-bold text-blue-900 min-h-[140px] resize-none"
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleEditSave}
                  disabled={editLoading}
                  className="flex-1 p-4 bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} /> {editLoading ? '저장 중...' : '수정 완료'}
                </button>
                <button
                  onClick={() => setEditingEntry(null)}
                  className="px-6 p-4 bg-blue-50 text-blue-700 rounded-2xl font-black hover:bg-blue-100 transition-all border border-blue-100"
                >
                  취소
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* List Header/Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-blue-50">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-xl overflow-hidden border border-blue-100 p-1 bg-blue-50/50">
            {(['yearly', 'monthly', 'category'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setGroupType(t); setFilterValue('all'); }}
                className={cn(
                  "px-4 py-2 text-xs font-black transition-all rounded-lg uppercase tracking-wide",
                  groupType === t ? "bg-blue-700 text-white shadow-md shadow-blue-200" : "text-blue-600/60 hover:text-blue-700"
                )}
              >
                {t === 'yearly' ? '연도별' : t === 'monthly' ? '월별' : '분야별'}
              </button>
            ))}
          </div>
          <div className="h-8 w-[1px] bg-blue-50 mx-2 hidden md:block" />
          <Filter size={18} className="text-blue-400" />
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="bg-blue-50/50 border border-blue-100 rounded-xl px-5 py-2.5 text-xs font-bold outline-none focus:border-blue-700 transition-all min-w-[160px] text-blue-900"
          >
            <option value="all">전체 명단 보기</option>
            {filterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-2 bg-blue-50 px-3 py-1.5 rounded-full">Total: {groupedData.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={exportToExcel} className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl hover:bg-emerald-100 transition-all flex items-center gap-2 text-xs font-black shadow-sm border border-emerald-100">
            <FileSpreadsheet size={16} /> EXCEL
          </button>
          <button onClick={exportToWord} className="p-3 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-100 transition-all flex items-center gap-2 text-xs font-black shadow-sm border border-blue-100">
            <FileText size={16} /> WORD
          </button>
          <button onClick={exportToPdf} className="p-3 bg-red-50 text-red-700 rounded-2xl hover:bg-red-100 transition-all flex items-center gap-2 text-xs font-black shadow-sm border border-red-100">
            <FilePdf size={16} /> PDF
          </button>
        </div>
      </div>

      {/* List Content */}
      <div className="space-y-3">
        {groupedData.map((entry) => (
          <div key={entry.id} className="bg-white rounded-3xl border border-blue-50 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
            <div
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              className="p-6 flex items-center gap-5 cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl text-blue-700 font-black text-[11px] shrink-0 border border-blue-100 group-hover:bg-blue-700 group-hover:text-white group-hover:border-blue-700 transition-all duration-300">
                <Calendar size={16} className="mb-1" />
                {entry.date.split('-').slice(1).join('/')}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-black text-blue-950 text-xl tracking-tight truncate">{entry.name}</h4>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wide border border-blue-100/50 whitespace-nowrap">{entry.position}</span>
                </div>
                <div className="flex items-center gap-5 text-[11px] text-blue-900/40 font-black uppercase tracking-wide">
                  <span className="flex items-center gap-2 bg-blue-50/30 px-2 py-0.5 rounded-md"><User size={14} className="text-blue-300" /> {entry.affiliation}</span>
                  <span className="flex items-center gap-2 bg-blue-50/30 px-2 py-0.5 rounded-md shrink-0"><Briefcase size={14} className="text-blue-300" /> {entry.category}</span>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-black tracking-wider shadow-inner">
                {entry.contact}
              </div>

              <div className="flex items-center gap-2">
                {canEdit && (
                  <>
                    <button
                      onClick={(e) => handleEditClick(e, entry)}
                      className="p-3 text-blue-200 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(entry.id);
                      }}
                      className="p-3 text-blue-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
                <div className="text-blue-200 shrink-0 group-hover:text-blue-700 transition-colors">
                  {expandedId === entry.id ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedId === entry.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="px-6 pb-8 pt-2 border-t border-blue-50 bg-blue-50/10">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-blue-400 mb-6">
                      <div className="w-1 h-3 bg-blue-300 rounded-full" /> Progress & Details
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-blue-950 font-bold bg-white p-8 rounded-2xl border border-blue-100 shadow-inner relative italic">
                      <Sparkles size={24} className="absolute -top-3 -left-3 text-blue-100" />
                      {entry.progress}
                    </p>
                    <div className="mt-6 flex justify-end items-center gap-4">
                      <span className="w-full h-[1px] bg-blue-50" />
                      <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest whitespace-nowrap">Registered: {new Date(entry.created_at).toLocaleString('ko-KR')}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {groupedData.length === 0 && (
          <div className="py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-blue-100 shadow-inner">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Users size={40} className="text-blue-200" />
            </div>
            <p className="font-black text-2xl text-blue-900 tracking-tight">데이터가 없습니다.</p>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-blue-200 mt-4">Check filters or add new entries</p>
          </div>
        )}
      </div>
    </div>
  );
}
