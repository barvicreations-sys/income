'use client';

import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { LayoutDashboard, Lock, Mail, User } from 'lucide-react';

interface AuthProps {
  onAuthenticated: (user: any) => void;
}

export default function Auth({ onAuthenticated }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          onAuthenticated({ uid: userCredential.user.uid, ...userDoc.data() });
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userData = {
          uid: userCredential.user.uid,
          email,
          name,
          role: 'admin', // First user becomes admin for now
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        onAuthenticated(userData);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        <div className="p-8 bg-primary text-white text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Barvi Graphic</h2>
          <p className="text-primary-foreground/80 text-sm mt-1 uppercase tracking-widest font-medium">Accounting Software</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center">
                  <User className="w-3 h-3 mr-2" /> Full Name
                </label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center">
                <Mail className="w-3 h-3 mr-2" /> Email Address
              </label>
              <input 
                required
                type="email" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@barvigraphic.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center">
                <Lock className="w-3 h-3 mr-2" /> Password
              </label>
              <input 
                required
                type="password" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-rose-500 text-xs font-medium bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isLogin ? 'Login to Portal' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-500 hover:text-primary transition-colors font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
