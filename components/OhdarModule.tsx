'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { Clock, Plus, Search, Loader2, Save, X, Calendar, DollarSign, User, AlertCircle } from 'lucide-react';
import { translations } from '../lib/translations';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, formatDate } from '../lib/utils';
import { OhdarRecord } from '../lib/types';

export default function OhdarModule({ user }: { user: any }) {
  const lang = user?.language || 'en';
  const t = translations[lang as keyof typeof translations];
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<OhdarRecord[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    workDescription: '',
    totalAmount: '',
    paidAmount: '',
    lastPaymentDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'ohdar'), orderBy('lastPaymentDate', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OhdarRecord)));
    } catch (err) {
      console.error("Error fetching ohdar:", err);
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
    const total = parseFloat(formData.totalAmount);
    const paid = parseFloat(formData.paidAmount);
    try {
      await addDoc(collection(db, 'ohdar'), {
        ...formData,
        totalAmount: total,
        paidAmount: paid,
        pendingAmount: total - paid,
        updatedBy: user.uid,
        updatedAt: serverTimestamp()
      });
      setShowAdd(false);
      setFormData({
        customerName: '',
        workDescription: '',
        totalAmount: '',
        paidAmount: '',
        lastPaymentDate: new Date().toISOString().split('T')[0],
        remarks: ''
      });
      fetchRecords();
    } catch (err) {
      console.error("Error saving ohdar:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => 
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.workDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = records.reduce((acc, r) => acc + (r.totalAmount - r.paidAmount), 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">{t.ohdar} (Credit)</h1>
          <p className="text-slate-400 text-sm mt-1">Manage outstanding balances and customer credit</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-amber-600/20"
        >
          <Plus size={20} />
          Add Credit Entry
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
          <div className="flex items-center gap-2 text-amber-400 font-bold bg-amber-400/10 px-4 py-2 rounded-xl border border-amber-400/20">
            <AlertCircle size={18} />
            Total Pending: {formatCurrency(totalPending)}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Work Description</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Paid</th>
                <th className="px-6 py-4">Pending</th>
                <th className="px-6 py-4">Last Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRecords.map((record) => {
                const pending = record.totalAmount - record.paidAmount;
                return (
                  <tr key={record.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                          <User size={16} />
                        </div>
                        <span className="text-sm font-semibold text-white">{record.customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{record.workDescription}</td>
                    <td className="px-6 py-4 font-semibold text-slate-300">{formatCurrency(record.totalAmount)}</td>
                    <td className="px-6 py-4 text-emerald-400">{formatCurrency(record.paidAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "font-bold",
                        pending > 0 ? "text-rose-400" : "text-emerald-400"
                      )}>
                        {formatCurrency(pending)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">{formatDate(record.lastPaymentDate)}</td>
                  </tr>
                );
              })}
              {filteredRecords.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">No records found</td>
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
              className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white font-display">New Credit Entry</h2>
                <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Work Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Graphic Designing, Printing"
                    value={formData.workDescription}
                    onChange={(e) => setFormData({...formData, workDescription: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Total Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={formData.totalAmount}
                        onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
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
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Last Payment Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="date"
                      required
                      value={formData.lastPaymentDate}
                      onChange={(e) => setFormData({...formData, lastPaymentDate: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-amber-600/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                  Save Credit Record
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
