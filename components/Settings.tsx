'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Database, 
  Cloud, 
  History,
  Save,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Settings({ user }: { user?: any }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        const logData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLogs(logData);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      fetchLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold font-display text-white">System Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account, system logs and security</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Section */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <User size={24} />
              </div>
              <h3 className="text-xl font-bold text-white font-display">User Profile</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.name || "Administrator"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  defaultValue={user?.email || "admin@barvi.edu"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-slate-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Preferred Language</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                  <option value="en">English (US)</option>
                  <option value="ur">Urdu (اردو)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Role</label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-slate-300 flex items-center gap-2">
                  <Shield size={16} className="text-blue-500" />
                  <span className="text-sm font-bold uppercase tracking-wider">{user?.role || "Super Admin"}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </section>

          {/* Security & System */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Database className="text-emerald-500" size={20} />
                <h4 className="font-bold text-white text-sm font-display">Database Sync</h4>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Status</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle size={14} /> Connected
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-4 leading-relaxed">
                Database is currently synchronized with Firebase Cloud Firestore. Real-time updates are enabled.
              </p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Cloud className="text-blue-500" size={20} />
                <h4 className="font-bold text-white text-sm font-display">Cloud Infrastructure</h4>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Uptime</span>
                <span className="text-xs font-bold text-blue-400">99.9%</span>
              </div>
              <p className="text-slate-400 text-xs mt-4 leading-relaxed">
                System is running on high-availability cloud nodes with automated failover and zero-downtime deployments.
              </p>
            </div>
          </section>
        </div>

        {/* Audit Logs Sidebar */}
        <div className="lg:col-span-1">
          <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl h-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <History size={20} />
              </div>
              <h3 className="text-lg font-bold text-white font-display">Recent Activity</h3>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="animate-spin text-slate-700" size={24} />
                </div>
              ) : logs.length > 0 ? (
                logs.map((log, i) => (
                  <div key={i} className="relative pl-6 pb-6 border-l border-slate-800 last:pb-0">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                    <p className="text-xs font-bold text-white mb-1 uppercase tracking-wider">{log.action}</p>
                    <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">{log.details}</p>
                    <p className="text-[10px] text-slate-700 font-mono">2 mins ago</p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="text-slate-800 mb-4" size={32} />
                  <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">No Recent Logs</p>
                </div>
              )}
            </div>

            <button className="w-full mt-8 py-3 rounded-xl border border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all">
              View Full Audit Trail
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
