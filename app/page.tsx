'use client';

import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { 
  getTotalPaddyPurchased, 
  getTotalRiceProduced, 
  getTotalBranProduced, 
  getTotalSales, 
  getTotalDue,
  getCashSales,
  getDueSales,
  getStock
} from '@/lib/sampleData';
import { Package, TrendingUp, DollarSign, CreditCard, Warehouse } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { calculateTotalKg } from '@/lib/stockUtils';
import { MILL_INFO } from '@/lib/constants';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const totalPaddy = getTotalPaddyPurchased();
  const totalRice = getTotalRiceProduced();
  const totalBran = getTotalBranProduced();
  const totalSalesAmount = getTotalSales();
  const totalDueAmount = getTotalDue();
  const cashSales = getCashSales();
  const dueSales = getDueSales();
  const currentStock = getStock();

  // Monthly sales data (sample)
  const monthlySales = [
    { month: 'Jan', sales: 44300 },
    { month: 'Feb', sales: 52000 },
    { month: 'Mar', sales: 48000 },
    { month: 'Apr', sales: 61000 },
    { month: 'May', sales: 55000 },
    { month: 'Jun', sales: 67000 },
  ];

  const cashVsDueData = [
    { name: 'নগদ', value: cashSales },
    { name: 'বাকি', value: dueSales },
  ];

  // Calculate total stock across all types
  const totalPaddyStockKg = Object.values(currentStock.paddy).reduce((sum, stock) => {
    return sum + calculateTotalKg(stock.kg, stock.bosta, stock.bostaSize);
  }, 0);
  const totalRiceStockKg = Object.values(currentStock.rice).reduce((sum, stock) => {
    return sum + calculateTotalKg(stock.kg, stock.bosta, stock.bostaSize);
  }, 0);
  const totalBranStockKg = Object.values(currentStock.bran).reduce((sum, stock) => {
    return sum + calculateTotalKg(stock.kg, stock.bosta, stock.bostaSize);
  }, 0);
  
  // Get bran stock types
  const branStockTypes = Object.entries(currentStock.bran).filter(([_, stock]) => {
    const total = calculateTotalKg(stock.kg, stock.bosta, stock.bostaSize);
    return total > 0;
  });

  const summaryCards = [
    {
      title: 'মোট কেনা ধান',
      value: `${totalPaddy.toLocaleString()} কেজি`,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'মোট উৎপাদিত চাল',
      value: `${totalRice.toLocaleString()} কেজি`,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'মোট উৎপাদিত ভুসি',
      value: `${totalBran.toLocaleString()} কেজি`,
      icon: Package,
      color: 'bg-yellow-500',
    },
    {
      title: 'মোট বিক্রয়',
      value: `৳${totalSalesAmount.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'মোট বাকি টাকা',
      value: `৳${totalDueAmount.toLocaleString()}`,
      icon: CreditCard,
      color: 'bg-red-500',
    },
  ];

  // Type-wise stock display
  const paddyStockTypes = Object.entries(currentStock.paddy).filter(([_, stock]) => {
    const total = calculateTotalKg(stock.kg, stock.bosta, stock.bostaSize);
    return total > 0;
  });
  
  const riceStockTypes = Object.entries(currentStock.rice).filter(([_, stock]) => {
    const total = calculateTotalKg(stock.kg, stock.bosta, stock.bostaSize);
    return total > 0;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{MILL_INFO.name}</h1>
          <p className="text-gray-600 mt-1">{MILL_INFO.address} | 📱 {MILL_INFO.mobile}</p>
          <p className="text-gray-500 mt-2 text-sm">ড্যাশবোর্ড - আপনার ধানকলের কার্যক্রমের সারসংক্ষেপ</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Type-wise Stock Cards */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">বর্তমান স্টক</h2>
          <div className="space-y-6">
            {/* Paddy Stock (Type-wise) */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ধানের স্টক (ধরন অনুযায়ী)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paddyStockTypes.map(([type, stock]) => {
                  const totalKg = calculateTotalKg(stock.kg, stock.bosta, stock.bostaSize);
                  return (
                    <div key={type} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-amber-900">{type}</p>
                      <p className="text-sm text-amber-700">
                        {stock.bosta} বস্তা + {stock.kg.toFixed(2)} কেজি
                      </p>
                      <p className="text-xs text-amber-600 mt-1">মোট: {totalKg.toFixed(2)} কেজি</p>
                    </div>
                  );
                })}
                {paddyStockTypes.length === 0 && (
                  <p className="text-gray-500">কোন ধানের স্টক নেই</p>
                )}
              </div>
            </div>
            
            {/* Rice Stock (Type-wise) */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">চালের স্টক (ধরন অনুযায়ী)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {riceStockTypes.map(([type, stock]) => {
                  const totalKg = calculateTotalKg(stock.kg, stock.bosta, stock.bostaSize);
                  return (
                    <div key={type} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-900">{type}</p>
                      <p className="text-sm text-green-700">
                        {stock.bosta} বস্তা ({stock.bostaSize}কেজি) + {stock.kg.toFixed(2)} কেজি
                      </p>
                      <p className="text-xs text-green-600 mt-1">মোট: {totalKg.toFixed(2)} কেজি</p>
                    </div>
                  );
                })}
                {riceStockTypes.length === 0 && (
                  <p className="text-gray-500">কোন চালের স্টক নেই</p>
                )}
              </div>
            </div>
            
            {/* Bran Stock */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ভুসির স্টক (ধরন অনুযায়ী)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branStockTypes.map(([type, stock]) => {
                  const totalKg = calculateTotalKg(stock.kg, stock.bosta, stock.bostaSize);
                  return (
                    <div key={type} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-yellow-900">{type}</p>
                      <p className="text-sm text-yellow-700">
                        {stock.bosta} বস্তা ({stock.bostaSize}কেজি) + {stock.kg.toFixed(2)} কেজি
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">মোট: {totalKg.toFixed(2)} কেজি</p>
                    </div>
                  );
                })}
                {branStockTypes.length === 0 && (
                  <p className="text-gray-500">কোন ভুসির স্টক নেই</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cash vs Due Sales */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">নগদ বনাম বাকির বিক্রি</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cashVsDueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cashVsDueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number | undefined) => `৳${(value || 0).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Sales Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">মাসভিত্তিক বিক্রয় রিপোর্ট</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number | undefined) => `৳${(value || 0).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="sales" fill="#3b82f6" name="বিক্রয় (৳)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
