'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { Moon, Search, Loader2, Save, Check, X } from 'lucide-react';
import { translations } from '../lib/translations';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function NamazModule({ user }: { user: any }) {
  const lang = user?.language || 'en';
  const t = translations[lang as keyof typeof translations];
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [prayerData, setPrayerData] = useState<Record<string, Record<string, boolean>>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const prayers = [
    { id: 'fajr', label: 'Fajr' },
    { id: 'zuhr', label: 'Zuhr' },
    { id: 'asr', label: 'Asr' },
    { id: 'maghrib', label: 'Maghrib' },
    { id: 'isha', label: 'Isha' }
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'students'), where('status', '==', 'active'));
        const snapshot = await getDocs(q);
        setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      fetchStudents();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const togglePrayer = (studentId: string, prayerId: string) => {
    setPrayerData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [prayerId]: !(prev[studentId]?.[prayerId])
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const promises = Object.entries(prayerData).map(([studentId, data]) => {
        return addDoc(collection(db, 'namaz'), {
          studentId,
          date,
          ...data,
          updatedBy: user.uid,
          updatedAt: serverTimestamp()
        });
      });
      await Promise.all(promises);
      alert('Prayer records saved successfully!');
    } catch (err) {
      console.error("Error saving namaz records:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">{t.namaz}</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor daily prayer habits of students</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSave}
            disabled={loading || Object.keys(prayerData).length === 0}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold px-6 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {t.save} Records
          </button>
        </div>
      </header>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Student Name</th>
                {prayers.map(p => (
                  <th key={p.id} className="px-6 py-4 text-center">{p.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors font-bold text-xs">
                        {student.name.charAt(0)}
                      </div>
                      <p className="text-sm font-semibold text-white">{student.name}</p>
                    </div>
                  </td>
                  {prayers.map(p => {
                    const isChecked = prayerData[student.id]?.[p.id];
                    return (
                      <td key={p.id} className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => togglePrayer(student.id, p.id)}
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all border",
                              isChecked 
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10" 
                                : "bg-slate-950 text-slate-600 border-slate-800 hover:border-slate-700 hover:text-slate-500"
                            )}
                          >
                            {isChecked ? <Check size={20} /> : <X size={16} />}
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
