export type UserRole = 'admin' | 'staff' | 'user';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
}

export interface Salary {
  id?: string;
  employeeId: string;
  employeeName: string;
  monthlySalary: number;
  paidAmount: number;
  remainingSalary: number;
  paymentDate: any;
  paymentMethod: string;
  remarks: string;
  month: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Income {
  id?: string;
  date: any;
  customerName: string;
  category: 'Design' | 'Video' | 'Printing' | 'Flex' | 'Visiting Card' | 'Logo' | 'Website' | 'Other';
  description: string;
  amount: number;
  receivedAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Expense {
  id?: string;
  date: any;
  expenseName: string;
  category: 'Electricity' | 'Gas' | 'Petrol' | 'School' | 'Tuition' | 'Hair' | 'Donation' | 'Rent' | 'Office Expense' | 'Other';
  description: string;
  amount: number;
  paymentMethod: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Ohdar {
  id?: string;
  name: string;
  totalAmount: number;
  receivedAmount: number;
  remaining: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface AuditLog {
  id?: string;
  collection: string;
  recordId: string;
  previousValue: any;
  newValue: any;
  timestamp: any;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete';
}

export interface Settings {
  openingBalance: number;
  lastClosingDate?: any;
}
