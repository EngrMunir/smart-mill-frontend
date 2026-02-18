import { BostaSize, StockQuantity } from './stockUtils';

// Paddy Types
export type PaddyType = '২৮' | 'চিকন' | 'পাঞ্জাব' | 'সাদা পাঞ্জাব' | 'সিলেটি' | '৪৯' | 'অন্যান্য';

// Rice Types
export type RiceType = 'মিনিকেট' | 'নাজিরশাইল' | 'কাটারি' | 'বাসমতি' | 'আতপ' | 'সিদ্ধ' | 'পোলাও চাল' | 'অন্যান্য';

// Bran Types (Bangla)
export type BranType = 'মোটা ভুসি' | 'চিকন ভুসি';

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalPurchased: number; // in KG
  totalDue: number;
}

// Individual bosta weight for paddy
export interface PaddyBosta {
  bostaNo: number;
  weightKg: number;
}

export interface PaddyPurchase {
  id: string;
  farmerId: string;
  farmerName: string;
  paddyType: PaddyType;
  customPaddyType?: string; // if Others is selected
  bostas: PaddyBosta[]; // Individual bosta weights
  totalBosta: number;
  totalKg: number;
  ratePerKg: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  date: string;
}

export interface Production {
  id: string;
  paddyType: PaddyType;
  customPaddyType?: string;
  riceType: RiceType;
  customRiceType?: string;
  paddyKg: number;
  paddyBosta: number;
  riceKg: number;
  riceBosta: number;
  riceBostaSize: BostaSize;
  // Bran output split by type
  motaBranKg: number;
  motaBranBosta: number;
  motaBranBostaSize: BostaSize;
  chikonBranKg: number;
  chikonBranBosta: number;
  chikonBranBostaSize: BostaSize;
  date: string;
}

export interface ExternalPurchase {
  id: string;
  productType: 'rice' | 'bran';
  riceType?: RiceType; // if productType is rice
  customRiceType?: string;
  branType?: BranType; // if productType is bran
  supplierName: string;
  quantityKg: number;
  quantityBosta: number;
  bostaSize: BostaSize;
  ratePerKg: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  date: string;
}

export interface Sale {
  id: string;
  type: 'rice' | 'bran';
  riceType?: RiceType; // if type is rice
  customRiceType?: string;
  branType?: BranType; // if type is bran
  customerName: string;
  // Selling by BOSTA only (not by KG)
  bosta25: number; // Number of 25kg bags
  bosta50: number; // Number of 50kg bags
  
  // For RICE: Price per BOSTA (not per KG)
  ratePerBosta25?: number; // Price per 25kg bag (for rice only)
  ratePerBosta50?: number; // Price per 50kg bag (for rice only)
  
  // For BRAN: Price per KG
  ratePerKg25?: number; // Price per KG for 25kg bags (for bran only)
  ratePerKg50?: number; // Price per KG for 50kg bags (for bran only)
  
  // Auto calculated fields
  totalKg25: number; // Auto calculated: bosta25 * 25
  totalKg50: number; // Auto calculated: bosta50 * 50
  totalKg: number; // Auto calculated: totalKg25 + totalKg50
  amount25: number; // Auto calculated
  amount50: number; // Auto calculated
  totalAmount: number; // Auto calculated: amount25 + amount50
  saleType: 'cash' | 'due';
  paidAmount: number;
  dueAmount: number;
  date: string;
}

export interface CustomerDue {
  id: string;
  customerName: string;
  totalDue: number;
  lastPaymentDate?: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  position: string;
  salary: number;
  lastPaidDate?: string;
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  month: string;
  year: number;
  date: string;
}

// Type-wise stock
export interface TypeWiseStock {
  [key: string]: StockQuantity; // key is type name
}

export interface Stock {
  paddy: TypeWiseStock; // key: paddy type
  rice: TypeWiseStock; // key: rice type
  bran: TypeWiseStock; // key: bran type (মোটা ভুসি / চিকন ভুসি)
}
