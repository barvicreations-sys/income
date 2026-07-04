'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  FileText, 
  Settings,
  LogOut,
  HandCoins
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userRole?: string;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, userRole }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'salary', label: 'Salary Management', icon: Users, roles: ['admin', 'staff'] },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expense', label: 'Expense', icon: TrendingDown },
    { id: 'ohdar', label: 'Ohdar (Receivable)', icon: HandCoins },
    { id: 'cashbook', label: 'Cash Book', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: FileText, roles: ['admin', 'staff'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => !item.roles || (userRole && item.roles.includes(userRole)));

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-20">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary tracking-tight">
          Barvi Graphic
          <span className="block text-xs font-normal text-slate-500 uppercase tracking-widest mt-1">Faisalabad</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
              activeTab === item.id
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-600 hover:bg-slate-50 hover:text-primary"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 mr-3 transition-colors",
              activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-primary"
            )} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors group"
        >
          <LogOut className="w-5 h-5 mr-3 text-slate-400 group-hover:text-red-600" />
          Logout
        </button>
      </div>
    </div>
  );
}
