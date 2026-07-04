import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  limit,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { Salary, Income, Expense, Ohdar, AuditLog, Settings } from './types';

// Real-time Listeners
export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void, filters?: { field: string, operator: any, value: any }[]) => {
  let q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
  
  if (filters) {
    filters.forEach(f => {
      q = query(q, where(f.field, f.operator, f.value));
    });
  }

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

// Generic CRUD
export const addRecord = async (collectionName: string, data: any) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateRecord = async (collectionName: string, id: string, data: any, previousValue: any, userId: string, userName: string) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });

  // Log edit
  await addDoc(collection(db, 'audit_logs'), {
    collection: collectionName,
    recordId: id,
    previousValue,
    newValue: data,
    timestamp: serverTimestamp(),
    userId,
    userName,
    action: 'update',
  });
};

export const deleteRecord = async (collectionName: string, id: string) => {
  await deleteDoc(doc(db, collectionName, id));
};

// Calculations
export const calculateTotals = (income: Income[], expenses: Expense[], salaries: Salary[], ohdar: Ohdar[]) => {
  const totalIncome = income.reduce((sum, item) => sum + item.receivedAmount, 0);
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalSalary = salaries.reduce((sum, item) => sum + item.paidAmount, 0);
  const totalOhdar = ohdar.reduce((sum, item) => sum + (item.totalAmount - item.receivedAmount), 0);
  
  const cashInHand = totalIncome - totalExpense - totalSalary; // Simplified, in reality would use paymentMethod filters
  
  // Method-specific totals
  const bankBalance = income.filter(i => i.paymentMethod === 'Bank').reduce((s, i) => s + i.receivedAmount, 0) - 
                      expenses.filter(e => e.paymentMethod === 'Bank').reduce((s, e) => s + e.amount, 0);
  
  const jazzCashBalance = income.filter(i => i.paymentMethod === 'JazzCash').reduce((s, i) => s + i.receivedAmount, 0) - 
                          expenses.filter(e => e.paymentMethod === 'JazzCash').reduce((s, e) => s + e.amount, 0);

  const pendingPayments = income.reduce((sum, item) => sum + item.remainingAmount, 0);
  const pendingSalary = salaries.reduce((sum, item) => sum + item.remainingSalary, 0);

  return {
    totalIncome,
    totalExpense,
    totalSalary,
    totalOhdar,
    cashInHand,
    bankBalance,
    jazzCashBalance,
    monthlyProfit: totalIncome - totalExpense - totalSalary,
    pendingPayments,
    pendingSalary,
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
  }).format(amount);
};
