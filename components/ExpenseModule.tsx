'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { TrendingDown, Plus, Search, Loader2, Save, X, Calendar, DollarSign, User } from 'lucide-react';
import { translations } from '../lib/translations';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, formatDate } from '../lib/utils';
import { ExpenseRecord } from '../lib/types';

export default function ExpenseModule({ user }: { user: any }) {
  const lang = user?.language || 'en';
  const t = translations[lang as keyof typeof translations];
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<ExpenseRecord[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Rent',
    date: new Date().toISOString().split('T')[0],
    paidTo: '',
    remarks: ''
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'expenses'), orderBy('date', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseRecord)));
    } catch (err) {
      console.error("Error fetching expenses:", err);
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
      await addDoc(collection(db, 'expenses'), {
        ...formData,
        amount: parseFloat(formData.amount),
        updatedBy: user.uid,
        updatedAt: serverTimestamp()
      });
      setShowAdd(false);
      setFormData({
        amount: '',
        category: 'Rent',
        date: new Date().toISOString().split('T')[0],
        paidTo: '',
        remarks: ''
      });
      fetchRecords();
    } catch (err) {
      console.error("Error saving expense:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => 
    r.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">{t.expenses}</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all school expenditures and payments</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-rose-600/20"
        >
          <Plus size={20} />
          {t.add} Expense
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
          <div className="flex items-center gap-2 text-rose-400 font-bold bg-rose-400/10 px-4 py-2 rounded-xl border border-rose-400/20">
            <TrendingDown size={18} />
            Total: {formatCurrency(records.reduce((acc, r) => acc + r.amount, 0))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">{t.date}</th>
                <th className="px-6 py-4">Paid To</th>
                <th className="px-6 py-4">{t.category}</th>
                <th className="px-6 py-4">{t.amount}</th>
                <th className="px-6 py-4">{t.remarks}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-300 font-mono">{formatDate(record.date)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                        <User size={16} />
                      </div>
                      <span className="text-sm font-semibold text-white">{record.paidTo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-700">
                      {record.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-rose-400">{formatCurrency(record.amount)}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{record.remarks}</td>
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
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white font-display">New Expense Entry</h2>
                <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500" size={18} />
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Paid To</label>
                  <input
                    type="text"
                    required
                    placeholder="Recipient or Shop Name"
                    value={formData.paidTo}
                    onChange={(e) => setFormData({...formData, paidTo: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Misc">Miscellaneous</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Remarks</label>
                  <textarea
                    rows={3}
                    placeholder="Additional details..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-rose-600/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                  Save Expense Record
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
