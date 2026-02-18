'use client';

import { useState, useEffect } from 'react';
import { dashboardAPI, stockAPI } from '@/lib/api';
import { Package, TrendingUp, DollarSign, CreditCard, Warehouse, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { calculateTotalKg } from '@/lib/stockUtils';
import { MILL_INFO } from '@/lib/constants';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function MillAdminDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [dashboardSummary, stockSummary] = await Promise.all([
          dashboardAPI.getSummary(),
          stockAPI.getAllStock()
        ]);
        setDashboardData(dashboardSummary);
        setStockData(stockSummary);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">ড্যাশবোর্ড লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  const summary = dashboardData?.data || {};
  const currentStock = stockData?.data || { paddy: {}, rice: {}, bran: {} };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ড্যাশবোর্ড</h1>
        <p className="text-gray-600 mt-2">{MILL_INFO.name}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">মোট কেনা ধান</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {summary.totalPaddyPurchased?.toLocaleString() || 0} কেজি
              </p>
            </div>
            <Package className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">মোট উৎপাদিত চাল</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {summary.totalRiceProduced?.toLocaleString() || 0} কেজি
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">মোট বিক্রয়</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                ৳{summary.totalSales?.toLocaleString() || 0}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">মোট বাকি টাকা</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                ৳{summary.totalDue?.toLocaleString() || 0}
              </p>
            </div>
            <CreditCard className="h-12 w-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Stock Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">ধান স্টক</h3>
          {Object.entries(currentStock.paddy || {}).map(([type, stock]: [string, any]) => (
            <p key={type} className="text-xs text-blue-600">
              {type}: {stock?.kg?.toFixed(2) || 0} কেজি
            </p>
          ))}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">চাল স্টক</h3>
          {Object.entries(currentStock.rice || {}).map(([type, stock]: [string, any]) => (
            <p key={type} className="text-xs text-green-600">
              {type}: {stock?.kg?.toFixed(2) || 0} কেজি
            </p>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">ভুসি স্টক</h3>
          {Object.entries(currentStock.bran || {}).map(([type, stock]: [string, any]) => (
            <p key={type} className="text-xs text-yellow-600">
              {type}: {stock?.kg?.toFixed(2) || 0} কেজি
            </p>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">নগদ বনাম বাকি বিক্রয়</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'নগদ', value: summary.cashSales || 0 },
                  { name: 'বাকি', value: summary.dueSales || 0 },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[summary.cashSales || 0, summary.dueSales || 0].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">মাসভিত্তিক বিক্রয়</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary.monthlySales || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="rice" fill="#10b981" name="চাল" />
              <Bar dataKey="bran" fill="#f59e0b" name="ভুসি" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}






































