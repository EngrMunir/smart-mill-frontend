import { Farmer, PaddyPurchase, Production, Sale, CustomerDue, Employee, SalaryPayment, Stock, ExternalPurchase, PaddyBosta } from './types';
import { StockQuantity, calculateTotalKg, normalizeStock } from './stockUtils';
import { DEFAULT_BOSTA_SIZE, PADDY_TYPES, RICE_TYPES, BRAN_TYPES } from './constants';

// Initial type-wise stock
export let stock: Stock = {
  paddy: {
    '২৮': { kg: 200, bosta: 4, bostaSize: DEFAULT_BOSTA_SIZE },
    'পাঞ্জাব': { kg: 300, bosta: 6, bostaSize: DEFAULT_BOSTA_SIZE },
    'চিকন': { kg: 0, bosta: 0, bostaSize: DEFAULT_BOSTA_SIZE },
  },
  rice: {
    'মিনিকেট': { kg: 150, bosta: 3, bostaSize: DEFAULT_BOSTA_SIZE },
    'নাজিরশাইল': { kg: 100, bosta: 2, bostaSize: DEFAULT_BOSTA_SIZE },
    'কাটারি': { kg: 75, bosta: 1, bostaSize: DEFAULT_BOSTA_SIZE },
  },
  bran: {
    'মোটা ভুসি': { kg: 60, bosta: 1, bostaSize: DEFAULT_BOSTA_SIZE },
    'চিকন ভুসি': { kg: 40, bosta: 0, bostaSize: DEFAULT_BOSTA_SIZE },
  },
};

export const farmers: Farmer[] = [
  { id: '1', name: 'Ram Kumar', phone: '9876543210', address: 'Village A', totalPurchased: 5000, totalDue: 5000 },
  { id: '2', name: 'Shyam Singh', phone: '9876543211', address: 'Village B', totalPurchased: 8000, totalDue: 2000 },
  { id: '3', name: 'Mohan Das', phone: '9876543212', address: 'Village C', totalPurchased: 3000, totalDue: 0 },
];

export const paddyPurchases: PaddyPurchase[] = [
  { 
    id: '1', 
    farmerId: '1', 
    farmerName: 'Ram Kumar',
    paddyType: '২৮',
    bostas: [
      { bostaNo: 1, weightKg: 42 },
      { bostaNo: 2, weightKg: 38 },
      { bostaNo: 3, weightKg: 45 },
      { bostaNo: 4, weightKg: 40 },
      { bostaNo: 5, weightKg: 43 },
    ],
    totalBosta: 5,
    totalKg: 208,
    ratePerKg: 25, 
    totalAmount: 5200, 
    paidAmount: 3000, 
    dueAmount: 2200, 
    date: '2024-01-15' 
  },
  { 
    id: '2', 
    farmerId: '2', 
    farmerName: 'Shyam Singh',
    paddyType: 'পাঞ্জাব',
    bostas: [
      { bostaNo: 1, weightKg: 48 },
      { bostaNo: 2, weightKg: 50 },
      { bostaNo: 3, weightKg: 47 },
      { bostaNo: 4, weightKg: 49 },
    ],
    totalBosta: 4,
    totalKg: 194,
    ratePerKg: 24, 
    totalAmount: 4656, 
    paidAmount: 4656, 
    dueAmount: 0, 
    date: '2024-01-20' 
  },
  { 
    id: '3', 
    farmerId: '3', 
    farmerName: 'Mohan Das',
    paddyType: 'চিকন',
    bostas: [
      { bostaNo: 1, weightKg: 35 },
      { bostaNo: 2, weightKg: 37 },
    ],
    totalBosta: 2,
    totalKg: 72,
    ratePerKg: 26, 
    totalAmount: 1872, 
    paidAmount: 1872, 
    dueAmount: 0, 
    date: '2024-01-25' 
  },
];

export const productions: Production[] = [
  { 
    id: '1', 
    paddyType: '২৮',
    riceType: 'মিনিকেট',
    paddyKg: 200, 
    paddyBosta: 4, 
    riceKg: 130, 
    riceBosta: 2, 
    riceBostaSize: 50,
    motaBranKg: 25, 
    motaBranBosta: 0, 
    motaBranBostaSize: 50,
    chikonBranKg: 15, 
    chikonBranBosta: 0, 
    chikonBranBostaSize: 50,
    date: '2024-01-16' 
  },
  { 
    id: '2', 
    paddyType: 'পাঞ্জাব',
    riceType: 'নাজিরশাইল',
    paddyKg: 300, 
    paddyBosta: 6, 
    riceKg: 195, 
    riceBosta: 3, 
    riceBostaSize: 50,
    motaBranKg: 35, 
    motaBranBosta: 0, 
    motaBranBostaSize: 50,
    chikonBranKg: 25, 
    chikonBranBosta: 0, 
    chikonBranBostaSize: 50,
    date: '2024-01-21' 
  },
];

export const externalPurchases: ExternalPurchase[] = [
  {
    id: '1',
    productType: 'rice',
    riceType: 'কাটারি',
    supplierName: 'ABC Rice Mill',
    quantityKg: 100,
    quantityBosta: 2,
    bostaSize: 50,
    ratePerKg: 42,
    totalAmount: 4200,
    paidAmount: 4200,
    dueAmount: 0,
    date: '2024-01-18',
  },
  {
    id: '2',
    productType: 'bran',
    branType: 'মোটা ভুসি',
    supplierName: 'XYZ Mill',
    quantityKg: 200,
    quantityBosta: 4,
    bostaSize: 50,
    ratePerKg: 12,
    totalAmount: 2400,
    paidAmount: 2400,
    dueAmount: 0,
    date: '2024-01-19',
  },
];

export const sales: Sale[] = [
  { 
    id: '1', 
    type: 'rice', 
    riceType: 'মিনিকেট',
    customerName: 'Local Market', 
    quantityKg: 50, 
    quantityBosta: 1, 
    bostaSize: 50,
    ratePerKg: 45, 
    totalAmount: 2250, 
    saleType: 'cash', 
    paidAmount: 2250, 
    dueAmount: 0, 
    date: '2024-01-17' 
  },
  { 
    id: '2', 
    type: 'rice', 
    riceType: 'নাজিরশাইল',
    customerName: 'Retailer A', 
    quantityKg: 30, 
    quantityBosta: 0, 
    bostaSize: 50,
    ratePerKg: 44, 
    totalAmount: 1320, 
    saleType: 'due', 
    paidAmount: 500, 
    dueAmount: 820, 
    date: '2024-01-18' 
  },
  { 
    id: '3', 
    type: 'bran', 
    branType: 'মোটা ভুসি',
    customerName: 'Feed Supplier', 
    quantityKg: 100, 
    quantityBosta: 2, 
    bostaSize: 50,
    ratePerKg: 15, 
    totalAmount: 1500, 
    saleType: 'cash', 
    paidAmount: 1500, 
    dueAmount: 0, 
    date: '2024-01-19' 
  },
];

export const customerDues: CustomerDue[] = [
  { id: '1', customerName: 'Retailer A', totalDue: 820, lastPaymentDate: '2024-01-18' },
];

export const employees: Employee[] = [
  { id: '1', name: 'Amit Kumar', phone: '9876543220', position: 'Mill Operator', salary: 15000, lastPaidDate: '2024-01-01' },
  { id: '2', name: 'Rajesh Singh', phone: '9876543221', position: 'Helper', salary: 10000, lastPaidDate: '2024-01-01' },
  { id: '3', name: 'Suresh Yadav', phone: '9876543222', position: 'Accountant', salary: 20000, lastPaidDate: '2024-01-01' },
];

export const salaryPayments: SalaryPayment[] = [
  { id: '1', employeeId: '1', employeeName: 'Amit Kumar', amount: 15000, month: 'January', year: 2024, date: '2024-01-01' },
  { id: '2', employeeId: '2', employeeName: 'Rajesh Singh', amount: 10000, month: 'January', year: 2024, date: '2024-01-01' },
  { id: '3', employeeId: '3', employeeName: 'Suresh Yadav', amount: 20000, month: 'January', year: 2024, date: '2024-01-01' },
];

// Helper functions
export const getTotalPaddyPurchased = () => {
  return paddyPurchases.reduce((sum, p) => sum + p.totalKg, 0);
};

export const getTotalRiceProduced = () => {
  return productions.reduce((sum, p) => {
    const riceTotal = calculateTotalKg(p.riceKg, p.riceBosta, p.riceBostaSize);
    return sum + riceTotal;
  }, 0);
};

export const getTotalBranProduced = () => {
  return productions.reduce((sum, p) => {
    const motaBranTotal = calculateTotalKg(p.motaBranKg, p.motaBranBosta, p.motaBranBostaSize);
    const chikonBranTotal = calculateTotalKg(p.chikonBranKg, p.chikonBranBosta, p.chikonBranBostaSize);
    return sum + motaBranTotal + chikonBranTotal;
  }, 0);
};

export const getTotalSales = () => {
  return sales.reduce((sum, s) => sum + s.totalAmount, 0);
};

export const getTotalDue = () => {
  const farmerDues = farmers.reduce((sum, f) => sum + f.totalDue, 0);
  const customerDuesTotal = customerDues.reduce((sum, c) => sum + c.totalDue, 0);
  return farmerDues + customerDuesTotal;
};

export const getCashSales = () => {
  return sales.filter(s => s.saleType === 'cash').reduce((sum, s) => sum + s.totalAmount, 0);
};

export const getDueSales = () => {
  return sales.filter(s => s.saleType === 'due').reduce((sum, s) => sum + s.totalAmount, 0);
};

// Stock management functions
export const updatePaddyStock = (paddyType: string, quantity: StockQuantity, operation: 'add' | 'subtract') => {
  if (!stock.paddy[paddyType]) {
    stock.paddy[paddyType] = { kg: 0, bosta: 0, bostaSize: DEFAULT_BOSTA_SIZE };
  }
  const currentTotalKg = calculateTotalKg(stock.paddy[paddyType].kg, stock.paddy[paddyType].bosta, stock.paddy[paddyType].bostaSize);
  const changeKg = calculateTotalKg(quantity.kg, quantity.bosta, quantity.bostaSize);
  const newTotalKg = operation === 'add' ? currentTotalKg + changeKg : currentTotalKg - changeKg;
  stock.paddy[paddyType] = normalizeStock(newTotalKg, stock.paddy[paddyType].bostaSize);
};

export const updateRiceStock = (riceType: string, quantity: StockQuantity, operation: 'add' | 'subtract') => {
  if (!stock.rice[riceType]) {
    stock.rice[riceType] = { kg: 0, bosta: 0, bostaSize: DEFAULT_BOSTA_SIZE };
  }
  const currentTotalKg = calculateTotalKg(stock.rice[riceType].kg, stock.rice[riceType].bosta, stock.rice[riceType].bostaSize);
  const changeKg = calculateTotalKg(quantity.kg, quantity.bosta, quantity.bostaSize);
  const newTotalKg = operation === 'add' ? currentTotalKg + changeKg : currentTotalKg - changeKg;
  stock.rice[riceType] = normalizeStock(newTotalKg, stock.rice[riceType].bostaSize);
};

export const updateBranStock = (branType: string, quantity: StockQuantity, operation: 'add' | 'subtract') => {
  if (!stock.bran[branType]) {
    stock.bran[branType] = { kg: 0, bosta: 0, bostaSize: DEFAULT_BOSTA_SIZE };
  }
  const currentTotalKg = calculateTotalKg(stock.bran[branType].kg, stock.bran[branType].bosta, stock.bran[branType].bostaSize);
  const changeKg = calculateTotalKg(quantity.kg, quantity.bosta, quantity.bostaSize);
  const newTotalKg = operation === 'add' ? currentTotalKg + changeKg : currentTotalKg - changeKg;
  stock.bran[branType] = normalizeStock(newTotalKg, stock.bran[branType].bostaSize);
};

export const getStock = (): Stock => {
  return { ...stock };
};
