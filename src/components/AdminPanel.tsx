import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Shield, User, MapPin, Trash2, Key, Pencil, X } from 'lucide-react';
import { UserProfile, Affiliation } from '../types';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface AdminPanelProps {
  onAddUser: (user: Omit<UserProfile, 'id'>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}

export default function AdminPanel({ onAddUser, onDeleteUser }: AdminPanelProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({ role: 'user' as 'admin' | 'user', password: '' });
  const [formData, setFormData] = useState({
    name: '',
    affiliation: '대외선교부' as Affiliation,
    role: 'user' as 'admin' | 'user'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('system_users').select('*');
      if (data) setUsers(data as UserProfile[]);
      else {
          const saved = localStorage.getItem('system_users');
          if (saved) setUsers(JSON.parse(saved));
      }
    } catch (err) {
      console.error(err);
      const saved = localStorage.getItem('system_users');
      if (saved) setUsers(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: Omit<UserProfile, 'id'> = {
      username: formData.name,
      name: formData.name,
      affiliation: formData.affiliation,
      role: formData.role,
      is_initial_password: true
    };

    try {
        await onAddUser(newUser);
        await fetchUsers();
        setFormData({ name: '', affiliation: '대외선교부', role: 'user' });
        alert(`${newUser.name} 유저가 추가되었습니다. 초기 비밀번호는 1234입니다.`);
    } catch (err) {
        console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    await onDeleteUser(id);
    await fetchUsers();
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({ role: user.role, password: '' });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    const updates: any = { role: editForm.role };
    if (editForm.password) {
      updates.password = editForm.password;
      updates.is_initial_password = false;
    }
    await supabase.from('system_users').update(updates).eq('id', editingUser.id);
    setEditingUser(null);
    await fetchUsers();
  };
  return (
    <div className="relative">
    {/* Edit Modal */}
    {editingUser && (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-lg text-blue-950 uppercase tracking-tight">유저 정보 수정</h3>
            <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-blue-50 rounded-xl transition-all">
              <X size={20} className="text-blue-300" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-blue-900/40 mb-1">이름</p>
              <p className="font-black text-blue-950">{editingUser.name}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40">권한</label>
              <div className="flex gap-2 bg-blue-50/50 p-1 rounded-xl border border-blue-100">
                <button
                  type="button"
                  onClick={() => setEditForm({...editForm, role: 'user'})}
                  className={cn(
                    "flex-1 p-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2",
                    editForm.role === 'user' ? "bg-blue-700 text-white" : "text-blue-600/40 hover:text-blue-600"
                  )}
                >
                  <User size={14} /> 일반 유저
                </button>
                <button
                  type="button"
                  onClick={() => setEditForm({...editForm, role: 'admin'})}
                  className={cn(
                    "flex-1 p-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2",
                    editForm.role === 'admin' ? "bg-blue-700 text-white" : "text-blue-600/40 hover:text-blue-600"
                  )}
                >
                  <Shield size={14} /> 관리자
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40">새 비밀번호 (변경 시에만 입력)</label>
              <input
                type="password"
                placeholder="비워두면 변경 안 됨"
                value={editForm.password}
                onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl outline-none focus:border-blue-700 font-bold text-blue-900 placeholder:text-blue-200"
              />
            </div>

            <button
              onClick={handleUpdateUser}
              className="w-full p-4 bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-800 transition-all"
            >
              수정 완료
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Add User Form */}
      <div className="bg-white rounded-3xl border border-blue-50 p-10 shadow-[0_15px_40px_rgba(29,78,216,0.04)]">
        <h3 className="font-black text-xl mb-8 flex items-center gap-3 text-blue-950 uppercase tracking-tight">
            <UserPlus size={24} className="text-blue-700" /> 새 유저 추가
        </h3>

        <form onSubmit={handleAddUser} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40">이름</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl outline-none focus:border-blue-700 font-bold text-blue-900 placeholder:text-blue-200" 
              placeholder="유저 성함"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40">소속</label>
            <select 
              required
              value={formData.affiliation}
              onChange={(e) => setFormData({...formData, affiliation: e.target.value as Affiliation})}
              className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-xl outline-none appearance-none font-bold text-blue-900"
            >
              <option value="대외선교부">대외선교부</option>
              <option value="IUBA 경상대센터">IUBA 경상대센터</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest font-black text-blue-900/40">권한 설정</label>
            <div className="flex gap-2 bg-blue-50/50 p-1 rounded-xl border border-blue-100">
                <button 
                    type="button"
                    onClick={() => setFormData({...formData, role: 'user'})}
                    className={cn(
                        "flex-1 p-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all",
                        formData.role === 'user' ? "bg-blue-700 text-white shadow-md shadow-blue-200" : "text-blue-600/40 hover:text-blue-600"
                    )}
                >
                    <User size={14} /> 일반 유저
                </button>
                <button 
                    type="button"
                    onClick={() => setFormData({...formData, role: 'admin'})}
                    className={cn(
                        "flex-1 p-3 rounded-lg text-xs font-black uppercase tracking-wide transition-all",
                        formData.role === 'admin' ? "bg-blue-700 text-white shadow-md shadow-blue-200" : "text-blue-600/40 hover:text-blue-600"
                    )}
                >
                    <Shield size={14} /> 관리자
                </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full p-5 bg-blue-700 text-white rounded-2xl font-black text-lg hover:bg-blue-800 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest mt-4"
          >
            유저 생성하기
          </button>
        </form>
      </div>

      {/* User List */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-blue-50 overflow-hidden shadow-[0_15px_40px_rgba(29,78,216,0.04)] flex flex-col">
          <div className="p-10 border-b border-blue-50 flex items-center justify-between">
            <h3 className="font-black text-xl flex items-center gap-3 text-blue-950 uppercase tracking-tight">
                <Shield size={24} className="text-blue-700" /> 시스템 유저 목록
            </h3>
            <span className="text-[10px] uppercase font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full tracking-[0.2em]">Total: {users.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {users.map(u => (
                <div key={u.id} className="p-6 flex items-center justify-between hover:bg-blue-50/20 transition-colors border-b border-blue-50/50 last:border-0 group">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center font-black text-blue-700 border border-blue-100 group-hover:bg-blue-700 group-hover:text-white group-hover:border-blue-700 transition-all duration-300">
                            {u.role === 'admin' ? <Shield size={22} /> : u.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="font-black text-blue-950 text-lg tracking-tight">{u.name}</span>
                                {u.role === 'admin' && <span className="bg-blue-700 text-white text-[9px] px-2 py-0.5 rounded-full uppercase font-black tracking-widest">Admin</span>}
                                {u.is_initial_password && <Key size={14} className="text-amber-400" title="Initial Password" />}
                            </div>
                            <div className="text-[11px] text-blue-900/40 font-black flex items-center gap-2 uppercase tracking-wide">
                                <MapPin size={12} className="text-blue-300" /> {u.affiliation}
                            </div>
                        </div>
                    </div>
                    
                    {u.username !== '관리자' && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                                onClick={() => handleEditUser(u)}
                                className="p-3 text-blue-300 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all"
                            >
                                <Pencil size={20} />
                            </button>
                            <button 
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-3 text-blue-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}
                </div>
            ))}
            {users.length === 0 && (
                <div className="py-32 text-center">
                    <User size={40} className="mx-auto text-blue-100 mb-4" />
                    <p className="text-sm font-black text-blue-200 uppercase tracking-widest italic">유저가 없습니다.</p>
                </div>
            )}
          </div>
      </div>
    </div>
    </div>
  );
}
