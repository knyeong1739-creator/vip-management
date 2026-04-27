import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
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
  Sparkles
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
}

export default function VIPList({ entries, onDelete }: VIPListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [groupType, setGroupType] = useState<'yearly' | 'monthly' | 'category'>('yearly');
  const [filterValue, setFilterValue] = useState<string>('all');

  // Grouping logic based on groupType
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

  // Unique options for filters
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

  // Export functions
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
    XLSX.writeFile(wb, `VIP_List_${groupType}_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                    children: [new Paragraph({ 
                        children: [new TextRun({ text: h, bold: true })] 
                    })] 
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
    saveAs(blob, `VIP_List_${groupType}.docx`);
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
    doc.save(`VIP_List_${groupType}.pdf`);
  };

  return (
    <div className="space-y-6">
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
                className="bg-blue-50/50 border border-blue-100 rounded-xl px-5 py-2.5 text-xs font-bold outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 transition-all min-w-[160px] text-blue-900"
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
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        if(confirm('이 기록을 삭제하시겠습니까?')) onDelete(entry.id);
                    }}
                    className="p-3 text-blue-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0"
                >
                    <Trash2 size={20} />
                </button>

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
