import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  PlusSquare, 
  Settings, 
  LogOut, 
  CalendarDays,
  Sparkles,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { VIPEntry, UserProfile, OutreachEvent } from '../types';
import VIPEntryForm from './VIPEntryForm';
import VIPList from './VIPList';
import AdminPanel from './AdminPanel';
import StatsOverview from './StatsOverview';
import EventModal from './EventModal';
import EventList from './EventList';

interface DashboardProps {
  user: UserProfile;
  onLogout: () => void;
  entries: VIPEntry[];
  onAddEntry: (entry: Omit<VIPEntry, 'id' | 'created_at'>) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  onRefreshData: () => Promise<void>;
  events: OutreachEvent[];
  onAddEvent: (event: Omit<OutreachEvent, 'id' | 'created_at'>) => void;
  onUpdateEvent: (event: OutreachEvent) => void;
  onDeleteEvent: (id: string) => Promise<void>;
  onAddUser: (user: Omit<UserProfile, 'id'>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}

type Tab = 'main' | 'list' | 'entry' | 'events' | 'admin';

export default function Dashboard({ 
  user, 
  onLogout, 
  entries, 
  onAddEntry, 
  onDeleteEntry,
  onRefreshData,
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onAddUser,
  onDeleteUser
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('main');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isWelcomePosterOpen, setIsWelcomePosterOpen] = useState(true);

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const navItems = [
    { id: 'main', label: '메인화면', icon: BarChart3 },
    { id: 'list', label: 'VIP 명단', icon: Users },
    { id: 'entry', label: 'VIP 전도 입력', icon: PlusSquare },
    { id: 'events', label: '행사 목록', icon: CalendarDays },
    ...(isAdmin ? [{ id: 'admin', label: '시스템 관리', icon: Settings }] : []),
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-blue-950 overflow-hidden font-sans relative">
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth <= 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 280 : (window.innerWidth <= 1024 ? 0 : 80),
          x: isSidebarOpen || window.innerWidth > 1024 ? 0 : -280
        }}
        className={cn(
          "bg-white border-r border-blue-100 flex flex-col shadow-lg z-40 h-full transition-all duration-300 ease-in-out",
          window.innerWidth <= 1024 ? "fixed inset-y-0 left-0" : "relative"
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-200">
              <Users size={24} />
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <h2 className="font-bold text-xl whitespace-nowrap text-blue-900">VIP 관리</h2>
                <p className="text-[10px] uppercase tracking-widest text-blue-600/50 whitespace-nowrap font-bold">Outreach Dept.</p>
              </div>
            )}
          </div>
          {window.innerWidth <= 1024 && isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-blue-50 rounded-lg">
              <X size={20} className="text-blue-400" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                if (window.innerWidth <= 1024) setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
                activeTab === item.id 
                  ? "bg-blue-700 text-white shadow-lg shadow-blue-200" 
                  : "hover:bg-blue-50 text-blue-800/60 hover:text-blue-900"
              )}
            >
              <item.icon size={20} className={cn(activeTab === item.id ? "text-white" : "text-blue-500")} />
              {isSidebarOpen && (
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              )}
              {activeTab === item.id && isSidebarOpen && (
                <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-50">
          <div className="p-3 bg-blue-50/50 rounded-xl flex items-center gap-3 mb-3 border border-blue-100">
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name.charAt(0)}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black text-blue-900 truncate">{user.name}</p>
                <p className="text-[10px] text-blue-600/60 font-bold truncate">{user.affiliation}</p>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-500 transition-all font-bold text-sm group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            {isSidebarOpen && <span>로그아웃</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 lg:h-20 bg-white border-b border-blue-50 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-2 lg:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors lg:hidden text-blue-700"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-black text-xl lg:text-2xl tracking-tight truncate max-w-[150px] lg:max-w-none text-blue-950 uppercase">
              {navItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button 
              onClick={() => setIsEventModalOpen(true)}
              className="flex items-center gap-2 px-3 lg:px-6 py-2.5 bg-blue-700 text-white rounded-full text-[10px] lg:text-xs font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-100"
            >
              <Sparkles size={12} /> <span className="hidden sm:inline">행사 일정 추가</span><span className="sm:hidden">추가</span>
            </button>
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100 whitespace-nowrap">
              <CalendarDays size={12} /> {formatDate(new Date())}
            </div>
          </div>
        </header>

        {/* Notification Banner */}
        <AnimatePresence>
          {upcomingEvents.length > 0 && activeTab === 'main' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 lg:px-8 pt-4 overflow-hidden"
            >
              <div className="bg-blue-900 text-white p-3 lg:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-xl shadow-blue-200/50 gap-3 border border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-700/50 rounded-lg flex items-center justify-center animate-pulse shrink-0">
                    <Bell size={16} className="text-white lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs lg:text-sm font-black flex items-center gap-2 uppercase tracking-wide">
                      다가오는 주요 행사
                      <span className="bg-red-500 text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter shrink-0 font-black">Urgent</span>
                    </h4>
                    <p className="text-[10px] lg:text-xs text-blue-200 font-bold italic truncate max-w-[200px] lg:max-w-none">
                      {upcomingEvents[0].title} • {upcomingEvents[0].date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-3 border-t sm:border-0 border-white/10 pt-2 sm:pt-0">
                  <span className="text-[9px] lg:text-[10px] font-bold text-blue-300 italic">
                    {upcomingEvents.length > 1 ? `+${upcomingEvents.length - 1} more` : 'Upcoming'}
                  </span>
                  <button
                    onClick={() => setActiveTab('events')}
                    className="px-4 py-2 bg-white text-blue-900 rounded-lg text-[10px] font-black hover:bg-blue-50 transition-all whitespace-nowrap shadow-md"
                  >
                    일정 확인
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto"
            >
              {activeTab === 'main' && (
                <StatsOverview entries={entries} upcomingEvents={upcomingEvents} />
              )}
              {activeTab === 'list' && (
                <VIPList entries={entries} onDelete={onDeleteEntry} />
              )}
              {activeTab === 'entry' && (
                <VIPEntryForm onAddEntry={onAddEntry} onComplete={() => setActiveTab('main')} />
              )}
              {activeTab === 'events' && (
                <EventList
                  events={events}
                  onAddEvent={onAddEvent}
                  onUpdateEvent={onUpdateEvent}
                  onDeleteEvent={onDeleteEvent}
                />
              )}
              {activeTab === 'admin' && isAdmin && (
                <AdminPanel onAddUser={onAddUser} onDeleteUser={onDeleteUser} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/[0.05] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none hidden lg:block" />
      </main>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onAddEvent={onAddEvent}
        onUpdateEvent={onUpdateEvent}
      />

      {/* 입장 시 포스터 팝업 */}
      <AnimatePresence>
        {isWelcomePosterOpen && upcomingEvents[0]?.poster_image && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWelcomePosterOpen(false)}
              className="absolute inset-0 bg-blue-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-blue-50"
            >
              <div className="p-5 flex items-center justify-between border-b border-blue-50">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] font-black text-blue-400 mb-1">다가오는 행사</p>
                  <h3 className="font-black text-blue-950 text-sm uppercase tracking-tight">{upcomingEvents[0].title}</h3>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">
                    {upcomingEvents[0].date} · {upcomingEvents[0].location}
                  </p>
                </div>
                <button
                  onClick={() => setIsWelcomePosterOpen(false)}
                  className="p-2 hover:bg-blue-50 text-blue-300 hover:text-blue-700 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <img
                src={upcomingEvents[0].poster_image}
                alt={upcomingEvents[0].title}
                className="w-full max-h-[65vh] object-contain bg-blue-50/30"
              />
              <div className="p-4 flex justify-end border-t border-blue-50">
                <button
                  onClick={() => setIsWelcomePosterOpen(false)}
                  className="px-6 py-2.5 bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}