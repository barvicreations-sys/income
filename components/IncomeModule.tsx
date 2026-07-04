'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Download, TrendingUp } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

interface IncomeRecord {
  id: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  receivedFrom: string;
  remarks: string;
}

export default function IncomeModule() {
  const [records, setRecords] = useState<IncomeRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    amount: 0,
    category: 'Sales',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    receivedFrom: '',
    remarks: ''
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'income'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IncomeRecord));
      setRecords(data);
    } catch (error) {
      console.error("Error fetching income:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'income'), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false);
      setFormData({
        amount: 0,
        category: 'Sales',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        receivedFrom: '',
        remarks: ''
      });
      fetchRecords();
    } catch (error) {
      console.error("Error adding income:", error);
    }
  };

  const filteredRecords = records.filter(r => 
    r.receivedFrom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Income Management</h2>
          <p className="text-slate-500">Log and track all incoming revenue.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded-xl flex items-center hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Income
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search income records..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Received From</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Method</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading...</td></tr>
              ) : filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 group">
                  <td className="px-6 py-4 font-medium text-slate-900">{record.receivedFrom}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg uppercase">
                      {record.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(record.amount)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{record.paymentMethod}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(record.date)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Add Income</h3>
              <button onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Received From</label>
                  <input required type="text" className="w-full px-4 py-2 border rounded-xl" value={formData.receivedFrom} onChange={e => setFormData({...formData, receivedFrom: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Amount</label>
                  <input required type="number" className="w-full px-4 py-2 border rounded-xl" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                  <select className="w-full px-4 py-2 border rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option>Sales</option>
                    <option>Services</option>
                    <option>Investments</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                  <input required type="date" className="w-full px-4 py-2 border rounded-xl" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20">Save Record</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
