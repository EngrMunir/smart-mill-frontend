'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Warehouse, Package, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { StockSummary } from '@/types';
import { getAllStock } from '@/services/stock.service';

export default function StockPage() {
  const [stockData, setStockData] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllStock();
      setStockData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const paddyStock = stockData?.paddy || {};
  const riceStock = stockData?.rice || {};
  const branStock = stockData?.bran || {};

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2">
          <Warehouse className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">স্টক ব্যবস্থাপনা</h1>
        </div>
        <p className="text-gray-600 mt-2">বর্তমান স্টক পরিস্থিতি দেখুন</p>
      </div>

      {/* Paddy Stock */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <CardTitle>ধান স্টক</CardTitle>
          </div>
          <CardDescription>ধানের বর্তমান স্টক</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(paddyStock).length === 0 ? (
            <p className="text-gray-500 text-center py-4">কোনো ধান স্টক নেই</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(paddyStock).map(([type, stock]: [string, any]) => (
                <div key={type} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <h3 className="font-semibold text-blue-900 mb-2">{type}</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      মোট: <span className="font-semibold text-blue-700">{stock.totalKg?.toFixed(2) || 0} কেজি</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      বস্তা: <span className="font-semibold text-blue-700">{stock.totalBosta || 0} টি</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rice Stock */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <CardTitle>চাল স্টক</CardTitle>
          </div>
          <CardDescription>চালের বর্তমান স্টক</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(riceStock).length === 0 ? (
            <p className="text-gray-500 text-center py-4">কোনো চাল স্টক নেই</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(riceStock).map(([type, stock]: [string, any]) => (
                <div key={type} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                  <h3 className="font-semibold text-green-900 mb-2">{type}</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      মোট: <span className="font-semibold text-green-700">{stock.totalKg?.toFixed(2) || 0} কেজি</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      বস্তা: <span className="font-semibold text-green-700">{stock.totalBosta || 0} টি</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bran Stock */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-yellow-600" />
            <CardTitle>ভুসি স্টক</CardTitle>
          </div>
          <CardDescription>ভুসির বর্তমান স্টক</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(branStock).length === 0 ? (
            <p className="text-gray-500 text-center py-4">কোনো ভুসি স্টক নেই</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(branStock).map(([type, stock]: [string, any]) => (
                <div key={type} className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
                  <h3 className="font-semibold text-yellow-900 mb-2">{type}</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      মোট: <span className="font-semibold text-yellow-700">{stock.totalKg?.toFixed(2) || 0} কেজি</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      বস্তা: <span className="font-semibold text-yellow-700">{stock.totalBosta || 0} টি</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}