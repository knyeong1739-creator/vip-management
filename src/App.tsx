/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { VIPEntry, UserProfile, LoginState, OutreachEvent } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PasswordChange from './components/PasswordChange';
import { supabase } from './lib/supabase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loginState, setLoginState] = useState<LoginState>(LoginState.LOGGED_OUT);
  const [entries, setEntries] = useState<VIPEntry[]>([]);
  const [events, setEvents] = useState<OutreachEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      await fetchUsers();
      await fetchEvents();
      await fetchEntries();
    };
    initialize();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('system_users').select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        localStorage.setItem('system_users', JSON.stringify(data));
      } else {
        const savedUsers = localStorage.getItem('system_users');
        if (!savedUsers) {
          const initialUsers: UserProfile[] = [
            { id: 'admin_root', username: '관리자', name: '시스템 관리자', affiliation: '대외선교부', role: 'admin', is_initial_password: false }
          ];
          localStorage.setItem('system_users', JSON.stringify(initialUsers));
          localStorage.setItem('pwd_관리자', '1925');
          await supabase.from('system_users').insert(initialUsers);
        }
      }
    } catch (err) {
      console.warn('Supabase fetch users failed:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('outreach_events')
        .select('*')
        .order('date', { ascending: true });
      if (error) throw error;
      if (data) setEvents(data);
      else {
        const savedEvents = localStorage.getItem('outreach_events');
        if (savedEvents) setEvents(JSON.parse(savedEvents));
      }
    } catch (err) {
      console.warn('Supabase fetch events failed, using localStorage:', err);
      const savedEvents = localStorage.getItem('outreach_events');
      if (savedEvents) setEvents(JSON.parse(savedEvents));
    }
  };

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('vip_list')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setEntries(data);
      else {
        const saved = localStorage.getItem('vip_entries');
        if (saved) setEntries(JSON.parse(saved));
      }
    } catch (err) {
      console.warn('Supabase fetch entries failed, using localStorage:', err);
      const saved = localStorage.getItem('vip_entries');
      if (saved) setEntries(JSON.parse(saved));
    }
  };

  const addEvent = async (eventData: Omit<OutreachEvent, 'id' | 'created_at'>) => {
    const newEvent: OutreachEvent = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    try {
      const { error } = await supabase.from('outreach_events').insert([newEvent]);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase add event failed:', err);
    }
    const updated = [newEvent, ...events];
    setEvents(updated);
    localStorage.setItem('outreach_events', JSON.stringify(updated));
  };

  const updateEvent = async (updatedEvent: OutreachEvent) => {
    try {
      const { error } = await supabase
        .from('outreach_events')
        .update(updatedEvent)
        .eq('id', updatedEvent.id);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase update event failed:', err);
    }
    const updated = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
    setEvents(updated);
    localStorage.setItem('outreach_events', JSON.stringify(updated));
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from('outreach_events').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase delete event failed:', err);
    }
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    localStorage.setItem('outreach_events', JSON.stringify(updated));
  };

  const handleLogin = async (username: string, password: string) => {
    setError(null);
    const { data, error } = await supabase
      .from('system_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();
    if (error || !data) {
      setError('이름 또는 비밀번호가 올바르지 않습니다.');
      return;
    }
    setCurrentUser(data as UserProfile);
    setLoginState(data.is_initial_password ? LoginState.NEED_PASSWORD_CHANGE : LoginState.LOGGED_IN);
  };

  const handlePasswordChange = async (newPassword: string) => {
    if (!currentUser) return;
    await supabase
      .from('system_users')
      .update({ password: newPassword, is_initial_password: false })
      .eq('id', currentUser.id);
    setLoginState(LoginState.LOGGED_IN);
  };

  const addEntry = async (entryData: Omit<VIPEntry, 'id' | 'created_at'>) => {
    const newEntry: VIPEntry = {
      ...entryData,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    try {
      const { error } = await supabase.from('vip_list').insert([newEntry]);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase add entry failed:', err);
    }
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem('vip_entries', JSON.stringify(updated));
  };

  const updateEntry = async (id: string, entryData: Omit<VIPEntry, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase.from('vip_list').update(entryData).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase update entry failed:', err);
    }
    await fetchEntries();
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('vip_list').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase delete entry failed:', err);
    }
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('vip_entries', JSON.stringify(updated));
  };

  const addUser = async (userData: Omit<UserProfile, 'id'>) => {
    const newUser: UserProfile = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      is_initial_password: true
    };
    try {
      const { error } = await supabase.from('system_users').insert([{ ...newUser, password: '1234' }]);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase add user failed:', err);
    }
    const savedUsers = JSON.parse(localStorage.getItem('system_users') || '[]');
    localStorage.setItem('system_users', JSON.stringify([...savedUsers, newUser]));
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('system_users').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete user failed:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginState(LoginState.LOGGED_OUT);
  };

  if (loginState === LoginState.LOGGED_OUT) {
    return <Login onLogin={handleLogin} error={error} />;
  }
  if (loginState === LoginState.NEED_PASSWORD_CHANGE) {
    return <PasswordChange onPasswordChange={handlePasswordChange} error={null} />;
  }
  if (currentUser && loginState === LoginState.LOGGED_IN) {
    return (
      <Dashboard
        user={currentUser}
        onLogout={handleLogout}
        entries={entries}
        onAddEntry={addEntry}
        onUpdateEntry={updateEntry}
        onDeleteEntry={deleteEntry}
        onRefreshData={fetchEntries}
        events={events}
        onAddEvent={addEvent}
        onUpdateEvent={updateEvent}
        onDeleteEvent={deleteEvent}
        onAddUser={addUser}
        onDeleteUser={deleteUser}
      />
    );
  }
  return null;
}
