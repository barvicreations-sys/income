'use client';

import React from 'react';
import { FileText, Download, PieChart, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Financial Reports</h2>
        <p className="text-slate-500">Generate and export business performance summaries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center mb-6">
            <PieChart className="w-6 h-6 text-primary mr-3" />
            <h3 className="text-lg font-bold">Income vs Expense</h3>
          </div>
          <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 italic">
            Chart Visualization Placeholder
          </div>
          <div className="mt-6 flex justify-between gap-4">
            <button className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 font-medium transition-colors">
              View Monthly
            </button>
            <button className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 font-medium transition-colors">
              View Yearly
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center mb-6">
            <BarChart3 className="w-6 h-6 text-primary mr-3" />
            <h3 className="text-lg font-bold">Salary Distribution</h3>
          </div>
          <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 italic">
            Chart Visualization Placeholder
          </div>
          <div className="mt-6">
            <button className="w-full py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold transition-colors flex items-center justify-center">
              <Download className="w-5 h-5 mr-2" />
              Download Full PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
