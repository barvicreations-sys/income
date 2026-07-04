'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { Banknote, Plus, Search, Loader2, Save, X, Calendar, DollarSign, User, CreditCard } from 'lucide-react';
import { translations } from '../lib/translations';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, formatDate } from '../lib/utils';
import { SalaryRecord } from '../lib/types';

export default function SalaryModule({ user }: { user: any }) {
  const lang = user?.language || 'en';
  const t = translations[lang as keyof typeof translations];
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    employeeName: '',
    designation: 'Teacher',
    month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    amount: '',
    paidAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    remarks: ''
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'salaries'), orderBy('paymentDate', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalaryRecord)));
    } catch (err) {
      console.error("Error fetching salaries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'salaries'), {
        ...formData,
        amount: parseFloat(formData.amount),
        paidAmount: parseFloat(formData.paidAmount),
        updatedBy: user.uid,
        updatedAt: serverTimestamp()
      });
      setShowAdd(false);
      setFormData({
        employeeName: '',
        designation: 'Teacher',
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        amount: '',
        paidAmount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        remarks: ''
      });
      fetchRecords();
    } catch (err) {
      console.error("Error saving salary:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => 
    r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.month.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">{t.salaries}</h1>
          <p className="text-slate-400 text-sm mt-1">Manage staff payroll and compensation</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/20"
        >
          <Plus size={20} />
          Record Salary
        </button>
      </header>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold bg-indigo-400/10 px-4 py-2 rounded-xl border border-indigo-400/20">
            <Banknote size={18} />
            Monthly Total: {formatCurrency(records.reduce((acc, r) => acc + r.paidAmount, 0))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">{t.date}</th>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Paid Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-300 font-mono">{formatDate(record.paymentDate)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{record.employeeName}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{record.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400">{record.month}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <CreditCard size={14} className="text-slate-500" />
                      {record.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-indigo-400">{formatCurrency(record.paidAmount)}</td>
                </tr>
              ))}
              {filteredRecords.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdd(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white font-display">Record Salary Payment</h2>
                <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Employee Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={formData.employeeName}
                      onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Designation</label>
                    <select
                      value={formData.designation}
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      <option value="Teacher">Teacher</option>
                      <option value="Admin">Admin Staff</option>
                      <option value="Principal">Principal</option>
                      <option value="Security">Security</option>
                      <option value="Support">Support Staff</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">For Month</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. June 2026"
                      value={formData.month}
                      onChange={(e) => setFormData({...formData, month: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Payment Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        type="date"
                        required
                        value={formData.paymentDate}
                        onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Base Salary</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Paid Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={formData.paidAmount}
                        onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Check">Check</option>
                      <option value="JazzCash">JazzCash</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="Bonus, deductions, or other notes..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                  Record Salary Payment
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
