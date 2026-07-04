'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import SalaryModule from '../components/SalaryModule';
import IncomeModule from '../components/IncomeModule';
import ExpenseModule from '../components/ExpenseModule';
import OhdarModule from '../components/OhdarModule';
import CashBook from '../components/CashBook';
import Reports from '../components/Reports';
import Auth from '../components/Auth';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // In a real app, you'd fetch the user role from Firestore here
        // For now, we'll assume admin if authenticated
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'admin' });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthenticated={setUser} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'salary': return <SalaryModule />;
      case 'income': return <IncomeModule />;
      case 'expense': return <ExpenseModule />;
      case 'ohdar': return <OhdarModule />;
      case 'cashbook': return <CashBook />;
      case 'reports': return <Reports />;
      case 'settings': return <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">Settings Module Coming Soon</div>;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        userRole={user?.role}
      />
      
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <header className="flex justify-between items-center mb-10">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Portal</span>
            <h1 className="text-xl font-bold text-slate-900">Barvi Graphic Faisalabad</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role} Account</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
