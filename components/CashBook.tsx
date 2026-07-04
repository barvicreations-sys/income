'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Book, TrendingUp, TrendingDown, Wallet, Loader2, ArrowRight } from 'lucide-react';
import { translations } from '../lib/translations';
import { motion } from 'motion/react';
import { formatCurrency } from '../lib/utils';

export default function CashBook({ user }: { user: any }) {
  const lang = user?.language || 'en';
  const t = translations[lang as keyof typeof translations];
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalSalary: 0,
    totalCredit: 0,
    cashInHand: 0
  });

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const incomeSnap = await getDocs(collection(db, 'income'));
      const expenseSnap = await getDocs(collection(db, 'expenses'));
      const salarySnap = await getDocs(collection(db, 'salaries'));
      const ohdarSnap = await getDocs(collection(db, 'ohdar'));

      let totalIncome = 0;
      incomeSnap.forEach(doc => totalIncome += doc.data().amount || 0);

      let totalExpense = 0;
      expenseSnap.forEach(doc => totalExpense += doc.data().amount || 0);

      let totalSalary = 0;
      salarySnap.forEach(doc => totalSalary += doc.data().paidAmount || 0);

      let totalCredit = 0;
      ohdarSnap.forEach(doc => {
        const data = doc.data();
        totalCredit += (data.totalAmount - data.paidAmount) || 0;
      });

      setSummary({
        totalIncome,
        totalExpense,
        totalSalary,
        totalCredit,
        cashInHand: totalIncome - totalExpense - totalSalary
      });
    } catch (err) {
      console.error("Error fetching summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSummary();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  const items = [
    { label: 'Total Income', value: summary.totalIncome, color: 'emerald', icon: TrendingUp },
    { label: 'Total Expenses', value: summary.totalExpense, color: 'rose', icon: TrendingDown },
    { label: 'Total Salaries Paid', value: summary.totalSalary, color: 'indigo', icon: Book },
    { label: 'Outstanding Credits', value: summary.totalCredit, color: 'amber', icon: ArrowRight },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold font-display text-white">{t.cashbook}</h1>
        <p className="text-slate-400 text-sm mt-1">Consolidated financial summary and balance</p>
      </header>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Wallet size={120} className="text-blue-500" />
        </div>

        <div className="relative z-10">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Net Cash in Hand</p>
          <h2 className="text-5xl font-bold text-white font-display mb-8">
            {formatCurrency(summary.cashInHand)}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-800">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center text-${item.color}-500 shadow-lg shadow-${item.color}-500/5`}>
                  <item.icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</p>
                  <p className="text-lg font-bold text-white font-display">{formatCurrency(item.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Financial Health
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Your net balance is positive. This indicates the school's income is currently covering expenses and staff salaries. 
            Keep monitoring outstanding credits to maintain liquidity.
          </p>
        </div>
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Quick Actions
          </h3>
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-colors">Generate PDF</button>
            <button className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-colors">Export CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
}
