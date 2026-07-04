'use client';

import { useState } from 'react';
import { BarChart3, FileText, Download, Filter, Search, Calendar, ChevronRight } from 'lucide-react';
import { translations } from '../lib/translations';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Reports({ user }: { user: any }) {
  const lang = user?.language || 'en';
  const t = translations[lang as keyof typeof translations];
  const [activeReport, setActiveReport] = useState('financial');

  const reports = [
    { id: 'financial', title: 'Financial Statement', desc: 'Income, expenses and profit summary', icon: FileText },
    { id: 'attendance', title: 'Attendance Report', desc: 'Monthly student presence analysis', icon: Calendar },
    { id: 'performance', title: 'Quran Performance', desc: 'Detailed student progress tracking', icon: BarChart3 },
    { id: 'salary', title: 'Payroll Summary', desc: 'Staff salary and bonus distribution', icon: FileText },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">{t.reports}</h1>
          <p className="text-slate-400 text-sm mt-1">Generate and export detailed school analytics</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
            <Filter size={18} />
            Filters
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
            <Download size={18} />
            Export All
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-3">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 text-left border",
                activeReport === report.id 
                  ? "bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-lg shadow-blue-600/5" 
                  : "bg-slate-900/30 text-slate-400 border-transparent hover:border-slate-800 hover:bg-slate-900/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                activeReport === report.id ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"
              )}>
                <report.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{report.title}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Report</p>
              </div>
              <ChevronRight size={16} className={cn(activeReport === report.id ? "opacity-100" : "opacity-0")} />
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <motion.div
            key={activeReport}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl min-h-[500px] flex flex-col items-center justify-center text-center"
          >
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-600 mb-6 border border-slate-700/50">
              <BarChart3 size={48} />
            </div>
            <h3 className="text-2xl font-bold text-white font-display mb-2">Report Generator</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-8">
              Select date ranges and categories to generate a comprehensive {activeReport} report. 
              Data will be processed in real-time.
            </p>
            <div className="flex gap-4">
              <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20">
                Generate Preview
              </button>
              <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-8 py-3 rounded-2xl transition-all border border-slate-700">
                Schedule Monthly
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
