export type UserRole = 'admin' | 'teacher' | 'accountant';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  language: 'en' | 'ur';
}

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  class: string;
  contact: string;
  admissionDate: string;
  status: 'active' | 'inactive';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'leave';
}

export interface QuranRecord {
  id: string;
  studentId: string;
  date: string;
  para: number;
  surah: string;
  verse: string;
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

export interface NamazRecord {
  id: string;
  studentId: string;
  date: string;
  fajr: boolean;
  zuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

export interface IncomeRecord {
  id: string;
  date: string;
  amount: number;
  category: string;
  receivedFrom: string;
  remarks: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  amount: number;
  category: string;
  paidTo: string;
  remarks: string;
}

export interface SalaryRecord {
  id: string;
  employeeName: string;
  designation: string;
  month: string;
  amount: number;
  paidAmount: number;
  paymentDate: string;
  paymentMethod: string;
  remarks: string;
}

export interface OhdarRecord {
  id: string;
  customerName: string;
  workDescription: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  lastPaymentDate: string;
  remarks: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  timestamp: any;
  details: string;
}
