'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, HandCoins, History } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

interface OhdarRecord {
  id: string;
  clientName: string;
  totalAmount: number;
  receivedAmount: number;
  pendingAmount: number;
  lastPaymentDate: string;
  remarks: string;
}

export default function OhdarModule() {
  const [records, setRecords] = useState<OhdarRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    clientName: '',
    totalAmount: 0,
    receivedAmount: 0,
    lastPaymentDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'ohdar'), orderBy('lastPaymentDate', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OhdarRecord));
      setRecords(data);
    } catch (error) {
      console.error("Error fetching ohdar:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pending = formData.totalAmount - formData.receivedAmount;
    try {
      await addDoc(collection(db, 'ohdar'), {
        ...formData,
        pendingAmount: pending,
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false);
      setFormData({
        clientName: '',
        totalAmount: 0,
        receivedAmount: 0,
        lastPaymentDate: new Date().toISOString().split('T')[0],
        remarks: ''
      });
      fetchRecords();
    } catch (error) {
      console.error("Error adding ohdar:", error);
    }
  };

  const filteredRecords = records.filter(r => 
    r.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ohdar (Receivable)</h2>
          <p className="text-slate-500">Manage client credits and pending payments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 text-white px-4 py-2 rounded-xl flex items-center hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Ohdar
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Client Name..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none"
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
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Client Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Total Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Received</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Pending</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Last Payment</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading...</td></tr>
              ) : filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 group">
                  <td className="px-6 py-4 font-medium text-slate-900">{record.clientName}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{formatCurrency(record.totalAmount)}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(record.receivedAmount)}</td>
                  <td className="px-6 py-4 font-bold text-rose-600">{formatCurrency(record.pendingAmount)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(record.lastPaymentDate)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg">
                        <History className="w-4 h-4" />
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
              <h3 className="text-xl font-bold">Add Ohdar Record</h3>
              <button onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Client Name</label>
                <input required type="text" className="w-full px-4 py-2 border rounded-xl" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Total Amount</label>
                  <input required type="number" className="w-full px-4 py-2 border rounded-xl" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Received Amount</label>
                  <input required type="number" className="w-full px-4 py-2 border rounded-xl" value={formData.receivedAmount} onChange={e => setFormData({...formData, receivedAmount: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Last Payment Date</label>
                <input required type="date" className="w-full px-4 py-2 border rounded-xl" value={formData.lastPaymentDate} onChange={e => setFormData({...formData, lastPaymentDate: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20">Save Record</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
