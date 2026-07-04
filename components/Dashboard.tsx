'use client';

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, 
  ArrowUpRight, ArrowDownRight, Calendar, Download, Filter, MoreHorizontal,
  PieChart as PieChartIcon, LayoutDashboard, Receipt, Wallet
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';

const data = [
  { name: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
  { name: 'Feb', revenue: 52000, expenses: 34000, profit: 18000 },
  { name: 'Mar', revenue: 48000, expenses: 31000, profit: 17000 },
  { name: 'Apr', revenue: 61000, expenses: 38000, profit: 23000 },
  { name: 'May', revenue: 55000, expenses: 36000, profit: 19000 },
  { name: 'Jun', revenue: 67000, expenses: 40000, profit: 27000 },
];

const pieData = [
  { name: 'Marketing', value: 400 },
  { name: 'Operations', value: 300 },
  { name: 'Salaries', value: 500 },
  { name: 'Tech', value: 200 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('6M');

  const stats = [
    { label: 'Total Revenue', value: 328450, trend: '+12.5%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total Expenses', value: 211000, trend: '-2.4%', icon: Receipt, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Net Profit', value: 117450, trend: '+18.2%', icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Clients', value: 124, trend: '+5', icon: Users, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Financial Dashboard</h1>
            <p className="text-slate-500">Welcome back, Barvi. Here&apos;s your accounting overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              <Filter size={16} />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
              <Download size={16} />
              Export Report
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-xl", stat.bg)}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded-full",
                  stat.trend.startsWith('+') ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                )}>
                  {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(stat.value)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Revenue Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold text-slate-900">Revenue vs Expenses</h3>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                {['1M', '3M', '6M', '1Y'].map(range => (
                  <button 
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      timeRange === range ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="expenses" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Expenses Breakdown */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-8">Expenses by Category</h3>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-2xl font-bold text-slate-900">$1,400</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client / Vendor</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { date: 'Oct 24, 2023', entity: 'Stripe Payout', category: 'Revenue', amount: 12500, status: 'Completed', type: 'in' },
                  { date: 'Oct 23, 2023', entity: 'Amazon Web Services', category: 'Tech', amount: -1240, status: 'Pending', type: 'out' },
                  { date: 'Oct 22, 2023', entity: 'Google Cloud', category: 'Tech', amount: -450, status: 'Completed', type: 'out' },
                  { date: 'Oct 21, 2023', entity: 'Acme Corp Payout', category: 'Revenue', amount: 8200, status: 'Completed', type: 'in' },
                ].map((tx, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 text-sm text-slate-600">{tx.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                          {tx.entity[0]}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{tx.entity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{tx.category}</span>
                    </td>
                    <td className={cn(
                      "px-6 py-4 text-sm font-bold",
                      tx.type === 'in' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {tx.type === 'in' ? '+' : ''}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                        tx.status === 'Completed' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
