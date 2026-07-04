'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Wallet, Building2, CreditCard } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function CashBook() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    cashInHand: 0,
    bankBalance: 0,
    jazzCash: 0,
    totalIncome: 0,
    totalExpense: 0,
    totalSalary: 0
  });

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const incomeSnap = await getDocs(collection(db, 'income'));
      const expenseSnap = await getDocs(collection(db, 'expenses'));
      const salarySnap = await getDocs(collection(db, 'salaries'));

      let totalIncome = 0;
      incomeSnap.forEach(doc => totalIncome += doc.data().amount || 0);

      let totalExpense = 0;
      expenseSnap.forEach(doc => totalExpense += doc.data().amount || 0);

      let totalSalary = 0;
      salarySnap.forEach(doc => totalSalary += doc.data().paidAmount || 0);

      setSummary({
        totalIncome,
        totalExpense,
        totalSalary,
        cashInHand: totalIncome - totalExpense - totalSalary,
        bankBalance: 300000, // Static for now as requested cards
        jazzCash: 15000     // Static for now
      });
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Cash Book</h2>
        <p className="text-slate-500">Real-time tracking of cash flow and balances.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl mr-4">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Cash in Hand</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(summary.cashInHand)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl mr-4">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Bank Balance</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(summary.bankBalance)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl mr-4">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">JazzCash Balance</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(summary.jazzCash)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold mb-6">Financial Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-4 border-b border-slate-50">
            <span className="text-slate-600 font-medium">Total Revenue (Income)</span>
            <span className="text-emerald-600 font-bold">{formatCurrency(summary.totalIncome)}</span>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-slate-50">
            <span className="text-slate-600 font-medium">Total Business Expenses</span>
            <span className="text-rose-600 font-bold">-{formatCurrency(summary.totalExpense)}</span>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-slate-50">
            <span className="text-slate-600 font-medium">Total Employee Salaries Paid</span>
            <span className="text-rose-600 font-bold">-{formatCurrency(summary.totalSalary)}</span>
          </div>
          <div className="flex justify-between items-center py-6 bg-slate-50 px-4 rounded-xl mt-4">
            <span className="text-slate-900 font-bold text-lg">Net Profit / Loss</span>
            <span className={cn(
              "font-black text-2xl",
              (summary.totalIncome - summary.totalExpense - summary.totalSalary) >= 0 ? "text-emerald-600" : "text-rose-600"
            )}>
              {formatCurrency(summary.totalIncome - summary.totalExpense - summary.totalSalary)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
