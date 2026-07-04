'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Database, 
  CloudBackuply, 
  History,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { AuditLog } from '@/lib/types';
import { formatCurrency } from '@/lib/data-utils';

export default function Settings() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      const logData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
      setLogs(logData);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">System Settings</h2>
        <p className="text-slate-500 text-sm">Configure your accounting preferences and view audit logs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
              <User size={48} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{user?.displayName}</h3>
            <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg shadow-blue-600/20">
              <Shield size={12} />
              {user?.role} Access
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-900/20">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Database size={16} /> Cloud Database
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Status</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Auto-Backup</span>
                <span className="text-xs font-bold text-slate-300">Enabled</span>
              </div>
              <button className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-700">
                Restore from Backup
              </button>
            </div>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History size={20} className="text-indigo-500" /> Recent Edit History
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 10 Actions</span>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="py-20 text-center text-slate-400 animate-pulse">Loading history...</div>
              ) : logs.length === 0 ? (
                <div className="py-20 text-center text-slate-400">No edits recorded yet.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                    <div className="shrink-0 w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Save size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-600">
                        <span className="font-bold text-slate-900">{log.userName}</span> 
                        {' '}{log.action === 'update' ? 'updated' : 'modified'} a record in 
                        {' '}<span className="font-bold text-indigo-600 capitalize">{log.collection}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Just now'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-tighter">
                        {log.action}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-4">
            <div className="shrink-0 w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 uppercase tracking-tight">Security Reminder</h4>
              <p className="text-xs text-amber-700 leading-relaxed mt-1">
                You are currently in the Master Admin role. Every action you take is being logged for security purposes. 
                Always log out after completing your accounting session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
