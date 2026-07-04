'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, addDoc, serverTimestamp, orderBy, limit, where } from 'firebase/firestore';
import { BookOpen, Search, Loader2, Save, History, TrendingUp, Star } from 'lucide-react';
import { translations } from '../lib/translations';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function QuranModule({ user }: { user: any }) {
  const lang = user?.language || 'en';
  const t = translations[lang as keyof typeof translations];
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStudent, setActiveStudent] = useState<any>(null);
  const [lesson, setLesson] = useState({
    para: 1,
    surah: '',
    verse: '',
    performance: 'excellent' as 'excellent' | 'good' | 'average' | 'poor'
  });

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

  const handleSave = async () => {
    if (!activeStudent) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'quranLessons'), {
        studentId: activeStudent.id,
        ...lesson,
        updatedBy: user.uid,
        updatedAt: serverTimestamp()
      });
      alert('Lesson progress saved!');
      setActiveStudent(null);
    } catch (err) {
      console.error("Error saving quran lesson:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold font-display text-white">{t.quran}</h1>
        <p className="text-slate-400 text-sm mt-1">Track student Quran progress and performance</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student List */}
        <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl flex flex-col h-[700px]">
          <div className="p-6 border-b border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredStudents.map((student) => (
              <button
                key={student.id}
                onClick={() => setActiveStudent(student)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group text-left",
                  activeStudent?.id === student.id 
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-600/5" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100 border border-transparent"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-colors",
                  activeStudent?.id === student.id ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500 group-hover:bg-slate-700"
                )}>
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{student.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Class {student.class}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Lesson Editor */}
        <div className="lg:col-span-2 space-y-8">
          {activeStudent ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl"
            >
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800">
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <BookOpen size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-display">Lesson for {activeStudent.name}</h2>
                  <p className="text-slate-400 text-sm">Update current lesson and evaluate performance</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Para (Juz)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={lesson.para}
                    onChange={(e) => setLesson({...lesson, para: parseInt(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Surah Name</label>
                  <input
                    type="text"
                    value={lesson.surah}
                    onChange={(e) => setLesson({...lesson, surah: e.target.value})}
                    placeholder="e.g. Al-Baqarah"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Verse Range</label>
                  <input
                    type="text"
                    value={lesson.verse}
                    onChange={(e) => setLesson({...lesson, verse: e.target.value})}
                    placeholder="e.g. 1-10"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Performance</label>
                  <select
                    value={lesson.performance}
                    onChange={(e) => setLesson({...lesson, performance: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                  >
                    <option value="excellent">Excellent (ممتاز)</option>
                    <option value="good">Good (جيد جدا)</option>
                    <option value="average">Average (جيد)</option>
                    <option value="poor">Needs Improvement (مقبول)</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                  {t.save} Lesson Progress
                </button>
                <button
                  onClick={() => setActiveStudent(null)}
                  className="px-6 py-4 rounded-2xl border border-slate-800 text-slate-400 hover:bg-slate-800 transition-colors font-bold"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="h-full bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-slate-800/50 rounded-3xl flex items-center justify-center text-slate-600 mb-6 border border-slate-700/50">
                <BookOpen size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-400 font-display">No Student Selected</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-xs">Select a student from the sidebar to record their lesson progress</p>
            </div>
          )}

          {/* Performance Overview (Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-emerald-500" size={20} />
                <h4 className="font-bold text-emerald-400 text-sm uppercase tracking-wider">Top Performers</h4>
              </div>
              <p className="text-slate-400 text-xs">85% of students are showing excellent progress this week.</p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Star className="text-blue-500" size={20} />
                <h4 className="font-bold text-blue-400 text-sm uppercase tracking-wider">Milestones</h4>
              </div>
              <p className="text-slate-400 text-xs">12 students completed their current Para (Juz) this month.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
