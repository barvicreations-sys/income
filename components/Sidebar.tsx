'use client';

import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  BookOpen, 
  Moon, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Book, 
  Banknote, 
  Clock, 
  BarChart3, 
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { translations } from '../lib/translations';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  user: any;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed, user, onLogout }: SidebarProps) {
  const lang = user?.language || 'en';
  const t = translations[lang as keyof typeof translations];

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard },
    { id: 'students', icon: Users, label: t.students },
    { id: 'attendance', icon: CalendarCheck, label: t.attendance },
    { id: 'quran', icon: BookOpen, label: t.quran },
    { id: 'namaz', icon: Moon, label: t.namaz },
    { type: 'header', label: t.accounts },
    { id: 'income', icon: TrendingUp, label: t.income },
    { id: 'expenses', icon: TrendingDown, label: t.expenses },
    { id: 'cashbook', icon: Book, label: t.cashbook },
    { id: 'salaries', icon: Banknote, label: t.salaries },
    { id: 'ohdar', icon: Clock, label: t.ohdar },
    { type: 'header', label: 'Other' },
    { id: 'reports', icon: BarChart3, label: t.reports },
    { id: 'settings', icon: SettingsIcon, label: t.settings },
  ];

  return (
    <aside 
      className={cn(
        "bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col fixed inset-y-0 z-50",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/20">
              B
            </div>
            <span className="font-bold font-display text-white truncate">BARVI SCHOOL</span>
          </motion.div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white mx-auto">
            B
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item, index) => {
          if (item.type === 'header') {
            return !collapsed ? (
              <h3 key={index} className="px-4 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-4">
                {item.label}
              </h3>
            ) : <div key={index} className="h-4" />;
          }

          const Icon = item.icon!;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id!)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Icon size={20} className={cn("shrink-0", isActive ? "text-blue-500" : "group-hover:scale-110 transition-transform")} />
              {!collapsed && (
                <span className="font-medium text-sm truncate">{item.label}</span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute right-2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 mt-auto border-t border-slate-800 space-y-4">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 overflow-hidden">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin User'}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate">{user?.role || 'Administrator'}</p>
            </div>
          </div>
        )}
        
        <button 
          onClick={onLogout}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span className="font-medium text-sm">{t.logout}</span>}
        </button>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
