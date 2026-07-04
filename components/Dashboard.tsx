'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Building2, 
  CreditCard, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: { value: number; isUp: boolean };
}

function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-xl", color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(value)}</h3>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalSalary: 0,
    totalOhdar: 0,
    cashInHand: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const fetchDashboardData = async () => {
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

      let totalOhdar = 0;
      ohdarSnap.forEach(doc => totalOhdar += doc.data().pendingAmount || 0);

      setSummary({
        totalIncome,
        totalExpense,
        totalSalary,
        totalOhdar,
        cashInHand: totalIncome - totalExpense - totalSalary
      });

      // Fetch some recent income as activity
      const recentIncomeQuery = query(collection(db, 'income'), orderBy('date', 'desc'), limit(5));
      const recentIncomeSnap = await getDocs(recentIncomeQuery);
      setRecentActivity(recentIncomeSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'income' })));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = [
    { title: 'Total Income', value: summary.totalIncome, icon: TrendingUp, color: 'bg-emerald-500' },
    { title: 'Total Expense', value: summary.totalExpense, icon: TrendingDown, color: 'bg-rose-500' },
    { title: 'Total Salary', value: summary.totalSalary, icon: CreditCard, color: 'bg-blue-500' },
    { title: 'Total Ohdar', value: summary.totalOhdar, icon: Clock, color: 'bg-amber-500' },
  ];

  const balances = [
    { title: 'Cash in Hand', value: summary.cashInHand, icon: Wallet, color: 'text-emerald-600' },
    { title: 'Bank Balance', value: 300000, icon: Building2, color: 'text-blue-600' }, // Static bank balance example
    { title: 'JazzCash', value: 15000, icon: CreditCard, color: 'text-amber-600' }, // Static jazzcash example
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-slate-500">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} trend={{ value: 12, isUp: true }} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic">No recent activity</div>
              ) : recentActivity.map((activity, i) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div className="flex items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center mr-4",
                      activity.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {activity.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{activity.category || 'Payment'}</p>
                      <p className="text-xs text-slate-500">From: {activity.receivedFrom || 'Client'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-bold",
                      activity.type === 'income' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {activity.type === 'income' ? '+' : '-'} {formatCurrency(activity.amount)}
                    </p>
                    <p className="text-xs text-slate-400">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-6">Current Balances</h3>
            <div className="space-y-6">
              {balances.map((balance, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <balance.icon className={cn("w-5 h-5 mr-3", balance.color)} />
                    <span className="text-sm font-medium text-slate-600">{balance.title}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(balance.value)}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-slate-50 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition-colors">
              Transfer Funds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
