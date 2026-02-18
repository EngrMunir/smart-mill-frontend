'use client';

import { sales, productions, paddyPurchases, salaryPayments } from '@/lib/sampleData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Download, Calendar } from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateTotalKg } from '@/lib/stockUtils';
import { MILL_INFO } from '@/lib/constants';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'sales' | 'production' | 'profit'>('sales');
  const [period, setPeriod] = useState<'daily' | 'monthly'>('monthly');

  // Calculate totals
  const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalPurchases = paddyPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalSalaries = salaryPayments.reduce((sum, s) => sum + s.amount, 0);
  const totalProfit = totalSales - totalPurchases - totalSalaries;

  // Sample monthly data
  const monthlySalesData = [
    { month: 'Jan', rice: 22500, bran: 3000 },
    { month: 'Feb', rice: 28000, bran: 4000 },
    { month: 'Mar', rice: 32000, bran: 5000 },
    { month: 'Apr', rice: 35000, bran: 6000 },
    { month: 'May', rice: 38000, bran: 6500 },
    { month: 'Jun', rice: 40000, bran: 7000 },
  ];

  const productionData = productions.map(p => ({
    date: p.date,
    paddyType: p.paddyType,
    riceType: p.riceType,
    paddy: p.paddyKg,
    rice: p.riceKg,
    bran: p.motaBranKg + p.chikonBranKg,
  }));

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{MILL_INFO.name}</h1>
            <p className="text-gray-600 mt-1">{MILL_INFO.address} | 📱 {MILL_INFO.mobile}</p>
            <p className="text-gray-500 mt-2 text-sm">রিপোর্ট - ব্যবসার রিপোর্ট দেখুন ও বিশ্লেষণ করুন</p>
          </div>
          <div className="flex gap-3">
            <Select value={reportType} onValueChange={(value) => setReportType(value as 'sales' | 'production' | 'profit')}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">বিক্রয় রিপোর্ট</SelectItem>
                <SelectItem value="production">উৎপাদন রিপোর্ট</SelectItem>
                <SelectItem value="profit">লাভ/ক্ষতি সারসংক্ষেপ</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={(value) => setPeriod(value as 'daily' | 'monthly')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">দৈনিক</SelectItem>
                <SelectItem value="monthly">মাসিক</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download size={20} className="mr-2" />
              এক্সপোর্ট
            </Button>
          </div>
        </div>

        {/* Sales Report */}
        {reportType === 'sales' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">মোট বিক্রয়</p>
                <p className="text-2xl font-bold text-gray-900">৳{totalSales.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">চাল বিক্রয়</p>
                <p className="text-2xl font-bold text-green-600">
                  ৳{sales.filter(s => s.type === 'rice').reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">ভুসি বিক্রয়</p>
                <p className="text-2xl font-bold text-yellow-600">
                  ৳{sales.filter(s => s.type === 'bran').reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">মাসিক বিক্রয় সারসংক্ষেপ</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number | undefined) => `৳${(value || 0).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="rice" fill="#10b981" name="চাল বিক্রয়" />
                  <Bar dataKey="bran" fill="#f59e0b" name="ভুসি বিক্রয়" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Rice Type-wise Sales Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">চালের ধরন অনুযায়ী বিক্রয় সারসংক্ষেপ</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['মিনিকেট', 'নাজিরশাইল', 'কাটারি', 'বাসমতি', 'আতপ', 'সিদ্ধ', 'পোলাও চাল'].map((riceType) => {
                  const typeSales = sales.filter(s => s.type === 'rice' && s.riceType === riceType);
                  const totalAmount = typeSales.reduce((sum, s) => sum + s.totalAmount, 0);
                  const totalKg = typeSales.reduce((sum, s) => sum + (s.totalKg || 0), 0);
                  if (totalAmount === 0) return null;
                  return (
                    <div key={riceType} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-900">{riceType}</p>
                      <p className="text-lg font-bold text-green-700 mt-1">৳{totalAmount.toLocaleString()}</p>
                      <p className="text-xs text-green-600 mt-1">{totalKg.toFixed(2)} কেজি</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">বিক্রয়ের বিস্তারিত</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>ধরন</TableHead>
                    <TableHead>চালের ধরন</TableHead>
                    <TableHead>গ্রাহক</TableHead>
                    <TableHead>পরিমাণ</TableHead>
                    <TableHead>মোট টাকা</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => {
                    return (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.date}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sale.type === 'rice' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sale.type === 'rice' ? 'চাল' : 'ভুসি'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {sale.riceType && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {sale.riceType}
                            </span>
                          )}
                          {sale.branType && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                              {sale.branType}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{sale.customerName}</TableCell>
                        <TableCell>
                          {sale.bosta25 > 0 && `${sale.bosta25} (২৫কেজি) `}
                          {sale.bosta50 > 0 && `${sale.bosta50} (৫০কেজি) `}
                          <span className="text-muted-foreground ml-1">({sale.totalKg?.toFixed(2) || 0} কেজি)</span>
                        </TableCell>
                        <TableCell className="font-medium">৳{sale.totalAmount.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Production Report */}
        {reportType === 'production' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">মোট প্রক্রিয়াজাত ধান</p>
                <p className="text-2xl font-bold text-gray-900">
                  {productions.reduce((sum, p) => sum + p.paddyKg, 0).toLocaleString()} কেজি
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">মোট উৎপাদিত চাল</p>
                <p className="text-2xl font-bold text-green-600">
                  {productions.reduce((sum, p) => sum + p.riceKg, 0).toLocaleString()} কেজি
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">মোট উৎপাদিত ভুসি</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {productions.reduce((sum, p) => sum + p.motaBranKg + p.chikonBranKg, 0).toLocaleString()} কেজি
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">উৎপাদন প্রবণতা</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={productionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="paddy" stroke="#3b82f6" name="ধান (কেজি)" />
                  <Line type="monotone" dataKey="rice" stroke="#10b981" name="চাল (কেজি)" />
                  <Line type="monotone" dataKey="bran" stroke="#f59e0b" name="ভুসি (কেজি)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">উৎপাদনের বিস্তারিত</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>ধানের ধরন</TableHead>
                    <TableHead>চালের ধরন</TableHead>
                    <TableHead>ইনপুট ধান</TableHead>
                    <TableHead>চাল আউটপুট</TableHead>
                    <TableHead>ভুসি আউটপুট</TableHead>
                    <TableHead>চাল ফলন %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productions.map((prod) => {
                    const paddyTotalKg = prod.paddyKg;
                    const riceTotalKg = prod.riceKg;
                    const branTotalKg = prod.motaBranKg + prod.chikonBranKg;
                    const riceYield = ((riceTotalKg / paddyTotalKg) * 100).toFixed(2);
                    return (
                      <TableRow key={prod.id}>
                        <TableCell>{prod.date}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {prod.paddyType}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            {prod.riceType}
                          </span>
                        </TableCell>
                        <TableCell>
                          {prod.paddyBosta > 0 && `${prod.paddyBosta} বস্তা + `}
                          {prod.paddyKg > 0 && `${prod.paddyKg} কেজি`}
                          <span className="text-muted-foreground ml-1">({paddyTotalKg.toFixed(2)} কেজি)</span>
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {prod.riceBosta > 0 && `${prod.riceBosta} বস্তা (${prod.riceBostaSize}কেজি) + `}
                          {prod.riceKg > 0 && `${prod.riceKg} কেজি`}
                          <span className="text-muted-foreground ml-1">({riceTotalKg.toFixed(2)} কেজি)</span>
                        </TableCell>
                        <TableCell className="text-yellow-600 font-medium">
                          {prod.motaBranKg > 0 && `${prod.motaBranKg} কেজি মোটা ভুসি `}
                          {prod.chikonBranKg > 0 && `${prod.chikonBranKg} কেজি চিকন ভুসি`}
                          <span className="text-muted-foreground ml-1">({branTotalKg.toFixed(2)} কেজি)</span>
                        </TableCell>
                        <TableCell>{riceYield}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Profit Summary */}
        {reportType === 'profit' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">মোট বিক্রয়</p>
                <p className="text-2xl font-bold text-green-600">৳{totalSales.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">মোট কেনা</p>
                <p className="text-2xl font-bold text-red-600">৳{totalPurchases.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">মোট বেতন</p>
                <p className="text-2xl font-bold text-orange-600">৳{totalSalaries.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 mb-1">নিট লাভ</p>
                <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ৳{totalProfit.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">লাভ/ক্ষতি বিশ্লেষণ</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">মোট আয় (বিক্রয়)</span>
                  <span className="text-green-600 font-bold text-lg">+৳{totalSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                  <span className="text-gray-700 font-medium">মোট খরচ (কেনা)</span>
                  <span className="text-red-600 font-bold text-lg">-৳{totalPurchases.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                  <span className="text-gray-700 font-medium">মোট বেতন</span>
                  <span className="text-orange-600 font-bold text-lg">-৳{totalSalaries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <span className="text-gray-900 font-bold text-lg">নিট লাভ</span>
                  <span className={`font-bold text-xl ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ৳{totalProfit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}






































