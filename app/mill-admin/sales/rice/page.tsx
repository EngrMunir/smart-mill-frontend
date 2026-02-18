'use client';

import { sales, updateRiceStock, updateBranStock, getStock } from '@/lib/sampleData';
import { RICE_TYPES, BRAN_TYPES, DEFAULT_BOSTA_SIZE, RiceType, BranType } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Printer, FileText, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { calculateTotalKg as calcTotalKg, normalizeStock, BostaSize } from '@/lib/stockUtils';
import { MILL_INFO } from '@/lib/constants';

export default function RiceSalesPage() {
  const [showForm, setShowForm] = useState(false);
  const [showMemo, setShowMemo] = useState<any>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    riceItems: [{
      id: Date.now().toString(),
    riceType: 'মিনিকেট' as RiceType,
    customRiceType: '',
    bosta25: 0,
    bosta50: 0,
    ratePerBosta25: '',
    ratePerBosta50: '',
    }] as Array<{
      id: string;
      riceType: RiceType;
      customRiceType: string;
      bosta25: number;
      bosta50: number;
      ratePerBosta25: string;
      ratePerBosta50: string;
    }>,
    branItems: [{
      id: Date.now().toString(),
      branType: 'মোটা ভুসি' as BranType,
      bosta25: 0,
      bosta50: 0,
      ratePerKg25: '',
      ratePerKg50: '',
    }] as Array<{
      id: string;
      branType: BranType;
      bosta25: number;
      bosta50: number;
      ratePerKg25: string;
      ratePerKg50: string;
    }>,
    saleType: 'cash' as 'cash' | 'due',
    paidAmount: '',
  });
  const currentStock = getStock();

  const allSales = sales.filter(s => s.type === 'rice' || s.type === 'bran' || s.type === 'mixed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let totalKg = 0;
    let totalAmount = 0;
    const riceItemsData: any[] = [];
    const branItemsData: any[] = [];

    // Calculate totals from all rice items
    formData.riceItems.forEach((item) => {
      const totalKg25 = item.bosta25 * 25;
      const totalKg50 = item.bosta50 * 50;
      const itemTotalKg = totalKg25 + totalKg50;
      
      const ratePerBosta25 = parseFloat(item.ratePerBosta25) || 0;
      const ratePerBosta50 = parseFloat(item.ratePerBosta50) || 0;
      
      const amount25 = item.bosta25 * ratePerBosta25;
      const amount50 = item.bosta50 * ratePerBosta50;
      const itemTotalAmount = amount25 + amount50;

      totalKg += itemTotalKg;
      totalAmount += itemTotalAmount;

      riceItemsData.push({
        riceType: item.riceType,
        customRiceType: item.riceType === 'অন্যান্য' ? item.customRiceType : undefined,
        bosta25: item.bosta25,
        bosta50: item.bosta50,
      ratePerBosta25,
      ratePerBosta50,
      totalKg25,
      totalKg50,
        totalKg: itemTotalKg,
        amount25,
        amount50,
        totalAmount: itemTotalAmount,
      });

      // Update stock
      const riceTypeKey = item.riceType === 'অন্যান্য' ? item.customRiceType : item.riceType;
      if (item.bosta25 > 0) {
        const stockQty25 = normalizeStock(item.bosta25 * 25, 25);
        updateRiceStock(riceTypeKey, stockQty25, 'subtract');
      }
      if (item.bosta50 > 0) {
        const stockQty50 = normalizeStock(item.bosta50 * 50, 50);
        updateRiceStock(riceTypeKey, stockQty50, 'subtract');
      }
    });

    // Calculate totals from all bran items
    formData.branItems.forEach((item) => {
      const totalKg25 = item.bosta25 * 25;
      const totalKg50 = item.bosta50 * 50;
      const itemTotalKg = totalKg25 + totalKg50;
      
      const ratePerKg25 = parseFloat(item.ratePerKg25) || 0;
      const ratePerKg50 = parseFloat(item.ratePerKg50) || 0;
      
      const amount25 = totalKg25 * ratePerKg25;
      const amount50 = totalKg50 * ratePerKg50;
      const itemTotalAmount = amount25 + amount50;

      totalKg += itemTotalKg;
      totalAmount += itemTotalAmount;

      branItemsData.push({
        branType: item.branType,
        bosta25: item.bosta25,
        bosta50: item.bosta50,
        ratePerKg25,
        ratePerKg50,
        totalKg25,
        totalKg50,
        totalKg: itemTotalKg,
      amount25,
      amount50,
        totalAmount: itemTotalAmount,
      });

      // Update stock
      if (item.bosta25 > 0) {
        const stockQty25 = normalizeStock(item.bosta25 * 25, 25);
        updateBranStock(item.branType, stockQty25, 'subtract');
      }
      if (item.bosta50 > 0) {
        const stockQty50 = normalizeStock(item.bosta50 * 50, 50);
        updateBranStock(item.branType, stockQty50, 'subtract');
      }
    });
    
    const paidAmount = formData.saleType === 'cash' ? totalAmount : parseFloat(formData.paidAmount);
    const dueAmount = totalAmount - paidAmount;

    const newSale = {
      id: Date.now().toString(),
      type: 'mixed' as const,
      riceItems: riceItemsData,
      branItems: branItemsData,
      customerName: formData.customerName,
      totalKg,
      totalAmount,
      saleType: formData.saleType,
      paidAmount,
      dueAmount,
      date: new Date().toISOString().split('T')[0],
    };

    console.log('Sale data:', newSale);

    setShowMemo(newSale);
    setShowForm(false);
    setFormData({
      customerName: '',
      riceItems: [{
        id: Date.now().toString(),
      riceType: 'মিনিকেট' as RiceType,
      customRiceType: '',
      bosta25: 0,
      bosta50: 0,
      ratePerBosta25: '',
      ratePerBosta50: '',
      }],
      branItems: [{
        id: Date.now().toString(),
        branType: 'মোটা ভুসি' as BranType,
        bosta25: 0,
        bosta50: 0,
        ratePerKg25: '',
        ratePerKg50: '',
      }],
      saleType: 'cash',
      paidAmount: '',
    });
  };

  const calculateTotal = () => {
    const riceTotal = formData.riceItems.reduce((sum, item) => {
      const ratePerBosta25 = parseFloat(item.ratePerBosta25) || 0;
      const ratePerBosta50 = parseFloat(item.ratePerBosta50) || 0;
      const amount25 = item.bosta25 * ratePerBosta25;
      const amount50 = item.bosta50 * ratePerBosta50;
      return sum + amount25 + amount50;
    }, 0);
    
    const branTotal = formData.branItems.reduce((sum, item) => {
      const ratePerKg25 = parseFloat(item.ratePerKg25) || 0;
      const ratePerKg50 = parseFloat(item.ratePerKg50) || 0;
      const amount25 = (item.bosta25 * 25) * ratePerKg25;
      const amount50 = (item.bosta50 * 50) * ratePerKg50;
      return sum + amount25 + amount50;
    }, 0);
    
    return riceTotal + branTotal;
  };

  const calculateTotalKg = () => {
    const riceKg = formData.riceItems.reduce((sum, item) => {
      return sum + (item.bosta25 * 25) + (item.bosta50 * 50);
    }, 0);
    
    const branKg = formData.branItems.reduce((sum, item) => {
      return sum + (item.bosta25 * 25) + (item.bosta50 * 50);
    }, 0);
    
    return riceKg + branKg;
  };

  const calculateDue = () => {
    if (formData.saleType === 'cash') return 0;
    const total = calculateTotal();
    const paid = parseFloat(formData.paidAmount) || 0;
    return total - paid;
  };

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">বিক্রি</h1>
            <p className="text-gray-600 mt-1">বিক্রি ব্যবস্থাপনা ও নগদ রশিদ তৈরি করুন</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={20} />
            নতুন বিক্রি
          </Button>
        </div>

        {/* Type-wise Stock Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">বর্তমান চালের স্টক (ধরন অনুযায়ী)</h2>
            <div className="grid grid-cols-1 gap-4">
            {Object.entries(currentStock.rice).map(([type, stock]) => {
              const totalKg = calcTotalKg(stock.kg, stock.bosta, stock.bostaSize);
              if (totalKg === 0) return null;
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
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">বর্তমান ভুসির স্টক (ধরন অনুযায়ী)</h2>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(currentStock.bran).map(([type, stock]) => {
                const totalKg = calcTotalKg(stock.kg, stock.bosta, stock.bostaSize);
                if (totalKg === 0) return null;
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
            </div>
          </div>
        </div>

        {/* Sales Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>নতুন বিক্রি</DialogTitle>
              <DialogDescription>
                নতুন বিক্রির রেকর্ড করুন
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="customer">গ্রাহকের নাম</Label>
                  <Input
                    id="customer"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">চালের ধরন</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newRiceItem = {
                          id: Date.now().toString(),
                          riceType: 'মিনিকেট' as RiceType,
                          customRiceType: '',
                          bosta25: 0,
                          bosta50: 0,
                          ratePerBosta25: '',
                          ratePerBosta50: '',
                        };
                        setFormData({
                          ...formData,
                          riceItems: [...formData.riceItems, newRiceItem],
                        });
                      }}
                    >
                      <Plus size={16} className="mr-1" />
                      চাল যোগ করুন
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.riceItems.map((riceItem, index) => (
                      <div key={riceItem.id} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                        {formData.riceItems.length > 1 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">চাল #{index + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  riceItems: formData.riceItems.filter((_, i) => i !== index),
                                });
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        )}
                        <div>
                          <Label htmlFor={`riceType-${riceItem.id}`}>চালের ধরন</Label>
                  <Select
                            value={riceItem.riceType}
                            onValueChange={(value) => {
                              const updatedItems = [...formData.riceItems];
                              updatedItems[index].riceType = value as RiceType;
                              updatedItems[index].customRiceType = '';
                              setFormData({ ...formData, riceItems: updatedItems });
                            }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RICE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                        {riceItem.riceType === 'অন্যান্য' && (
                  <div>
                            <Label htmlFor={`customRiceType-${riceItem.id}`}>কাস্টম চালের ধরন</Label>
                    <Input
                              id={`customRiceType-${riceItem.id}`}
                      required
                              value={riceItem.customRiceType}
                              onChange={(e) => {
                                const updatedItems = [...formData.riceItems];
                                updatedItems[index].customRiceType = e.target.value;
                                setFormData({ ...formData, riceItems: updatedItems });
                              }}
                      placeholder="কাস্টম চালের ধরন লিখুন"
                    />
                  </div>
                )}
                        <div className="space-y-4">
                          <h5 className="font-medium text-gray-900 text-sm">বস্তা বিক্রি (শুধুমাত্র বস্তা হিসেবে)</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`bosta25-${riceItem.id}`}>২৫ কেজি বস্তা সংখ্যা</Label>
                              <Input
                                id={`bosta25-${riceItem.id}`}
                                type="number"
                                min="0"
                                value={riceItem.bosta25}
                                onChange={(e) => {
                                  const updatedItems = [...formData.riceItems];
                                  updatedItems[index].bosta25 = parseInt(e.target.value) || 0;
                                  setFormData({ ...formData, riceItems: updatedItems });
                                }}
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`rate25-${riceItem.id}`}>২৫ কেজি প্রতি বস্তার দাম (৳)</Label>
                              <Input
                                id={`rate25-${riceItem.id}`}
                                type="number"
                                step="0.01"
                                value={riceItem.ratePerBosta25}
                                onChange={(e) => {
                                  const updatedItems = [...formData.riceItems];
                                  updatedItems[index].ratePerBosta25 = e.target.value;
                                  setFormData({ ...formData, riceItems: updatedItems });
                                }}
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`bosta50-${riceItem.id}`}>৫০ কেজি বস্তা সংখ্যা</Label>
                              <Input
                                id={`bosta50-${riceItem.id}`}
                                type="number"
                                min="0"
                                value={riceItem.bosta50}
                                onChange={(e) => {
                                  const updatedItems = [...formData.riceItems];
                                  updatedItems[index].bosta50 = parseInt(e.target.value) || 0;
                                  setFormData({ ...formData, riceItems: updatedItems });
                                }}
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`rate50-${riceItem.id}`}>৫০ কেজি প্রতি বস্তার দাম (৳)</Label>
                              <Input
                                id={`rate50-${riceItem.id}`}
                                type="number"
                                step="0.01"
                                value={riceItem.ratePerBosta50}
                                onChange={(e) => {
                                  const updatedItems = [...formData.riceItems];
                                  updatedItems[index].ratePerBosta50 = e.target.value;
                                  setFormData({ ...formData, riceItems: updatedItems });
                                }}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded border space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">২৫ কেজি মোট টাকা:</span>
                              <span className="font-semibold">৳{(riceItem.bosta25 * (parseFloat(riceItem.ratePerBosta25) || 0)).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">৫০ কেজি মোট টাকা:</span>
                              <span className="font-semibold">৳{(riceItem.bosta50 * (parseFloat(riceItem.ratePerBosta50) || 0)).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm border-t pt-1">
                              <span className="text-gray-600">মোট বস্তা:</span>
                              <span className="font-semibold">{riceItem.bosta25 + riceItem.bosta50} টি</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 italic">
                              <span>মোট কেজি (তথ্য):</span>
                              <span>{(riceItem.bosta25 * 25) + (riceItem.bosta50 * 50)} কেজি</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">ভুসির ধরন</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newBranItem = {
                            id: Date.now().toString(),
                            branType: 'মোটা ভুসি' as BranType,
                            bosta25: 0,
                            bosta50: 0,
                            ratePerKg25: '',
                            ratePerKg50: '',
                          };
                          setFormData({
                            ...formData,
                            branItems: [...formData.branItems, newBranItem],
                          });
                        }}
                      >
                        <Plus size={16} className="mr-1" />
                        ভুসি যোগ করুন
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {formData.branItems.map((branItem, index) => (
                        <div key={branItem.id} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                          {formData.branItems.length > 1 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">ভুসি #{index + 1}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    branItems: formData.branItems.filter((_, i) => i !== index),
                                  });
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          )}
                          <div>
                            <Label htmlFor={`branType-${branItem.id}`}>ভুসির ধরন</Label>
                            <Select
                              value={branItem.branType}
                              onValueChange={(value) => {
                                const updatedItems = [...formData.branItems];
                                updatedItems[index].branType = value as BranType;
                                setFormData({ ...formData, branItems: updatedItems });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {BRAN_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-4">
                            <h5 className="font-medium text-gray-900 text-sm">বস্তা বিক্রি (শুধুমাত্র বস্তা হিসেবে)</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                                <Label htmlFor={`bosta25-bran-${branItem.id}`}>২৫ কেজি বস্তা সংখ্যা</Label>
                      <Input
                                  id={`bosta25-bran-${branItem.id}`}
                        type="number"
                        min="0"
                                  value={branItem.bosta25}
                                  onChange={(e) => {
                                    const updatedItems = [...formData.branItems];
                                    updatedItems[index].bosta25 = parseInt(e.target.value) || 0;
                                    setFormData({ ...formData, branItems: updatedItems });
                                  }}
                        placeholder="0"
                      />
                    </div>
                    <div>
                                <Label htmlFor={`rateKg25-${branItem.id}`}>২৫ কেজি প্রতি কেজির দাম (৳)</Label>
                      <Input
                                  id={`rateKg25-${branItem.id}`}
                        type="number"
                        step="0.01"
                                  value={branItem.ratePerKg25}
                                  onChange={(e) => {
                                    const updatedItems = [...formData.branItems];
                                    updatedItems[index].ratePerKg25 = e.target.value;
                                    setFormData({ ...formData, branItems: updatedItems });
                                  }}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                                <Label htmlFor={`bosta50-bran-${branItem.id}`}>৫০ কেজি বস্তা সংখ্যা</Label>
                      <Input
                                  id={`bosta50-bran-${branItem.id}`}
                        type="number"
                        min="0"
                                  value={branItem.bosta50}
                                  onChange={(e) => {
                                    const updatedItems = [...formData.branItems];
                                    updatedItems[index].bosta50 = parseInt(e.target.value) || 0;
                                    setFormData({ ...formData, branItems: updatedItems });
                                  }}
                        placeholder="0"
                      />
                    </div>
                    <div>
                                <Label htmlFor={`rateKg50-${branItem.id}`}>৫০ কেজি প্রতি কেজির দাম (৳)</Label>
                      <Input
                                  id={`rateKg50-${branItem.id}`}
                        type="number"
                        step="0.01"
                                  value={branItem.ratePerKg50}
                                  onChange={(e) => {
                                    const updatedItems = [...formData.branItems];
                                    updatedItems[index].ratePerKg50 = e.target.value;
                                    setFormData({ ...formData, branItems: updatedItems });
                                  }}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">২৫ কেজি মোট টাকা:</span>
                                <span className="font-semibold">৳{((branItem.bosta25 * 25) * (parseFloat(branItem.ratePerKg25) || 0)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">৫০ কেজি মোট টাকা:</span>
                                <span className="font-semibold">৳{((branItem.bosta50 * 50) * (parseFloat(branItem.ratePerKg50) || 0)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-1">
                      <span className="text-gray-600">মোট বস্তা:</span>
                                <span className="font-semibold">{branItem.bosta25 + branItem.bosta50} টি</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 italic">
                      <span>মোট কেজি (তথ্য):</span>
                                <span>{(branItem.bosta25 * 25) + (branItem.bosta50 * 50)} কেজি</span>
                              </div>
                    </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="saleType">বিক্রির ধরন</Label>
                  <Select
                    value={formData.saleType}
                    onValueChange={(value) => setFormData({ ...formData, saleType: value as 'cash' | 'due' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">নগদ</SelectItem>
                      <SelectItem value="due">বাকি (ক্রেডিট)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.saleType === 'due' && (
                  <div>
                    <Label htmlFor="paid">পরিশোধিত টাকা (৳)</Label>
                    <Input
                      id="paid"
                      type="number"
                      required
                      step="0.01"
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                    />
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">মোট টাকা:</span>
                    <span className="font-semibold">৳{calculateTotal().toLocaleString()}</span>
                  </div>
                  {formData.saleType === 'due' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">বাকি টাকা:</span>
                      <span className="font-semibold text-red-600">৳{calculateDue().toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-500 italic border-t pt-2">
                    <span>মোট কেজি (তথ্য):</span>
                    <span>{calculateTotalKg()} কেজি</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  বাতিল
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  বিক্রি সংরক্ষণ করুন
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Cash Memo Dialog */}
        {showMemo && (
          <Dialog open={!!showMemo} onOpenChange={() => setShowMemo(null)}>
            <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>নগদ রশিদ</span>
                  <Button variant="ghost" size="icon" onClick={() => window.print()}>
                    <Printer size={20} />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <div className="border-2 border-gray-300 p-6 space-y-4 print:border-black overflow-y-auto flex-1">
                <div className="text-center border-b pb-4">
                  <h3 className="text-xl font-bold">{MILL_INFO.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{MILL_INFO.address}</p>
                  <p className="text-sm text-gray-600">📱 {MILL_INFO.mobile}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-2">নগদ রশিদ</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">রশিদ নং:</span>
                    <span className="font-medium">#{showMemo.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">তারিখ:</span>
                    <span className="font-medium">{showMemo.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">গ্রাহক:</span>
                    <span className="font-medium">{showMemo.customerName}</span>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-4">
                  {showMemo.type === 'mixed' || (showMemo.riceItems && showMemo.branItems) ? (
                    <>
                      {showMemo.riceItems && Array.isArray(showMemo.riceItems) && showMemo.riceItems.length > 0 && (
                        <div>
                          <div className="font-semibold text-gray-900 mb-2">চাল</div>
                          {showMemo.riceItems.map((item: any, index: number) => (
                            <div key={index} className="border-t pt-3 space-y-2">
                              <div className="font-medium text-gray-900">
                                চাল #{index + 1}: {item.riceType || item.customRiceType || 'N/A'}
                              </div>
                              {item.bosta25 > 0 && (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span>২৫ কেজি বস্তা সংখ্যা:</span>
                                    <span className="font-medium">{item.bosta25} টি</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>২৫ কেজি প্রতি বস্তার দাম:</span>
                                    <span className="font-medium">৳{item.ratePerBosta25}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>২৫ কেজি মোট টাকা:</span>
                                    <span className="font-medium">৳{item.amount25?.toLocaleString() || ((item.bosta25 * (item.ratePerBosta25 || 0)).toLocaleString())}</span>
                                  </div>
                                </>
                              )}
                              {item.bosta50 > 0 && (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span>৫০ কেজি বস্তা সংখ্যা:</span>
                                    <span className="font-medium">{item.bosta50} টি</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>৫০ কেজি প্রতি বস্তার দাম:</span>
                                    <span className="font-medium">৳{item.ratePerBosta50}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>৫০ কেজি মোট টাকা:</span>
                                    <span className="font-medium">৳{item.amount50?.toLocaleString() || ((item.bosta50 * (item.ratePerBosta50 || 0)).toLocaleString())}</span>
                                  </div>
                                </>
                              )}
                              <div className="flex justify-between text-sm font-medium border-t pt-1">
                                <span>এই চালের মোট:</span>
                                <span>৳{item.totalAmount?.toLocaleString() || ((item.amount25 || 0) + (item.amount50 || 0)).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {showMemo.branItems && Array.isArray(showMemo.branItems) && showMemo.branItems.length > 0 && (
                        <div>
                          <div className="font-semibold text-gray-900 mb-2">ভুসি</div>
                          {showMemo.branItems.map((item: any, index: number) => (
                            <div key={index} className="border-t pt-3 space-y-2">
                              <div className="font-medium text-gray-900">
                                ভুসি #{index + 1}: {item.branType || 'N/A'}
                              </div>
                              {item.bosta25 > 0 && (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span>২৫ কেজি বস্তা সংখ্যা:</span>
                                    <span className="font-medium">{item.bosta25} টি</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>২৫ কেজি প্রতি কেজির দাম:</span>
                                    <span className="font-medium">৳{item.ratePerKg25}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>২৫ কেজি মোট টাকা:</span>
                                    <span className="font-medium">৳{item.amount25?.toLocaleString() || (((item.bosta25 * 25) * (item.ratePerKg25 || 0)).toLocaleString())}</span>
                                  </div>
                                </>
                              )}
                              {item.bosta50 > 0 && (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span>৫০ কেজি বস্তা সংখ্যা:</span>
                                    <span className="font-medium">{item.bosta50} টি</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>৫০ কেজি প্রতি কেজির দাম:</span>
                                    <span className="font-medium">৳{item.ratePerKg50}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>৫০ কেজি মোট টাকা:</span>
                                    <span className="font-medium">৳{item.amount50?.toLocaleString() || (((item.bosta50 * 50) * (item.ratePerKg50 || 0)).toLocaleString())}</span>
                                  </div>
                                </>
                              )}
                              <div className="flex justify-between text-sm font-medium border-t pt-1">
                                <span>এই ভুসির মোট:</span>
                                <span>৳{item.totalAmount?.toLocaleString() || ((item.amount25 || 0) + (item.amount50 || 0)).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : showMemo.type === 'rice' && showMemo.riceItems && Array.isArray(showMemo.riceItems) ? (
                    showMemo.riceItems.map((item: any, index: number) => (
                      <div key={index} className="border-t pt-3 space-y-2">
                        <div className="font-medium text-gray-900">
                          চাল #{index + 1}: {item.riceType || item.customRiceType || 'N/A'}
                        </div>
                        {item.bosta25 > 0 && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>২৫ কেজি বস্তা সংখ্যা:</span>
                              <span className="font-medium">{item.bosta25} টি</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>২৫ কেজি প্রতি বস্তার দাম:</span>
                              <span className="font-medium">৳{item.ratePerBosta25}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>২৫ কেজি মোট টাকা:</span>
                              <span className="font-medium">৳{item.amount25?.toLocaleString() || ((item.bosta25 * (item.ratePerBosta25 || 0)).toLocaleString())}</span>
                            </div>
                          </>
                        )}
                        {item.bosta50 > 0 && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>৫০ কেজি বস্তা সংখ্যা:</span>
                              <span className="font-medium">{item.bosta50} টি</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>৫০ কেজি প্রতি বস্তার দাম:</span>
                              <span className="font-medium">৳{item.ratePerBosta50}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>৫০ কেজি মোট টাকা:</span>
                              <span className="font-medium">৳{item.amount50?.toLocaleString() || ((item.bosta50 * (item.ratePerBosta50 || 0)).toLocaleString())}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between text-sm font-medium border-t pt-1">
                          <span>এই চালের মোট:</span>
                          <span>৳{item.totalAmount?.toLocaleString() || ((item.amount25 || 0) + (item.amount50 || 0)).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  ) : showMemo.type === 'bran' && showMemo.branItems && Array.isArray(showMemo.branItems) ? (
                    showMemo.branItems.map((item: any, index: number) => (
                      <div key={index} className="border-t pt-3 space-y-2">
                        <div className="font-medium text-gray-900">
                          ভুসি #{index + 1}: {item.branType || 'N/A'}
                        </div>
                        {item.bosta25 > 0 && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>২৫ কেজি বস্তা সংখ্যা:</span>
                              <span className="font-medium">{item.bosta25} টি</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>২৫ কেজি প্রতি কেজির দাম:</span>
                              <span className="font-medium">৳{item.ratePerKg25}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>২৫ কেজি মোট টাকা:</span>
                              <span className="font-medium">৳{item.amount25?.toLocaleString() || (((item.bosta25 * 25) * (item.ratePerKg25 || 0)).toLocaleString())}</span>
                            </div>
                          </>
                        )}
                        {item.bosta50 > 0 && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>৫০ কেজি বস্তা সংখ্যা:</span>
                              <span className="font-medium">{item.bosta50} টি</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>৫০ কেজি প্রতি কেজির দাম:</span>
                              <span className="font-medium">৳{item.ratePerKg50}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>৫০ কেজি মোট টাকা:</span>
                              <span className="font-medium">৳{item.amount50?.toLocaleString() || (((item.bosta50 * 50) * (item.ratePerKg50 || 0)).toLocaleString())}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between text-sm font-medium border-t pt-1">
                          <span>এই ভুসির মোট:</span>
                          <span>৳{item.totalAmount?.toLocaleString() || ((item.amount25 || 0) + (item.amount50 || 0)).toLocaleString()}</span>
                        </div>
                  </div>
                    ))
                  ) : (
                    // Fallback for old format
                    <>
                  {showMemo.riceType && (
                    <div className="flex justify-between">
                      <span>চালের ধরন:</span>
                      <span className="font-medium">{showMemo.riceType}</span>
                    </div>
                  )}
                      {showMemo.branType && (
                        <div className="flex justify-between">
                          <span>ভুসির ধরন:</span>
                          <span className="font-medium">{showMemo.branType}</span>
                        </div>
                      )}
                  {showMemo.bosta25 > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>২৫ কেজি বস্তা সংখ্যা:</span>
                        <span className="font-medium">{showMemo.bosta25} টি</span>
                      </div>
                      <div className="flex justify-between">
                            <span>২৫ কেজি {showMemo.type === 'rice' ? 'প্রতি বস্তার' : 'প্রতি কেজির'} দাম:</span>
                            <span className="font-medium">৳{showMemo.ratePerBosta25 || showMemo.ratePerKg25}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>২৫ কেজি মোট টাকা:</span>
                            <span className="font-medium">৳{showMemo.amount25?.toLocaleString() || ((showMemo.bosta25 * ((showMemo.ratePerBosta25 || showMemo.ratePerKg25 || 0))).toLocaleString())}</span>
                      </div>
                    </>
                  )}
                  {showMemo.bosta50 > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>৫০ কেজি বস্তা সংখ্যা:</span>
                        <span className="font-medium">{showMemo.bosta50} টি</span>
                      </div>
                      <div className="flex justify-between">
                            <span>৫০ কেজি {showMemo.type === 'rice' ? 'প্রতি বস্তার' : 'প্রতি কেজির'} দাম:</span>
                            <span className="font-medium">৳{showMemo.ratePerBosta50 || showMemo.ratePerKg50}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>৫০ কেজি মোট টাকা:</span>
                            <span className="font-medium">৳{showMemo.amount50?.toLocaleString() || ((showMemo.bosta50 * ((showMemo.ratePerBosta50 || showMemo.ratePerKg50 || 0))).toLocaleString())}</span>
                      </div>
                        </>
                      )}
                    </>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>সর্বমোট টাকা:</span>
                    <span>৳{showMemo.totalAmount.toLocaleString()}</span>
                  </div>
                  {showMemo.saleType === 'due' && (
                    <>
                      <div className="flex justify-between">
                        <span>পরিশোধ:</span>
                        <span className="text-green-600">৳{showMemo.paidAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>বাকি:</span>
                        <span className="text-red-600">৳{showMemo.dueAmount.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="border-t pt-4 text-center text-sm text-gray-600">
                  <p>আপনার ব্যবসার জন্য ধন্যবাদ!</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Sales History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">বিক্রির ইতিহাস</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>তারিখ</TableHead>
                <TableHead>গ্রাহক</TableHead>
                <TableHead>পণ্যের ধরন</TableHead>
                <TableHead>বস্তা (২৫/৫০)</TableHead>
                <TableHead>মোট কেজি</TableHead>
                <TableHead>মোট টাকা</TableHead>
                <TableHead>ধরন</TableHead>
                <TableHead className="text-right">কর্ম</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allSales.map((sale) => {
                const bosta25 = sale.bosta25 || 0;
                const bosta50 = sale.bosta50 || 0;
                const totalBosta = bosta25 + bosta50;
                const totalKg = sale.totalKg || ((bosta25 * 25) + (bosta50 * 50));
                return (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell className="font-medium">{sale.customerName}</TableCell>
                    <TableCell>
                      {sale.type === 'mixed' ? (
                        <div className="space-y-1">
                          {sale.riceItems && Array.isArray(sale.riceItems) && sale.riceItems.length > 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium block">
                              চাল ({sale.riceItems.length} ধরন)
                            </span>
                          )}
                          {sale.branItems && Array.isArray(sale.branItems) && sale.branItems.length > 0 && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium block">
                              ভুসি ({sale.branItems.length} ধরন)
                            </span>
                          )}
                        </div>
                      ) : (
                        <>
                          {sale.type === 'rice' && sale.riceType && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              চাল: {sale.riceType}
                            </span>
                          )}
                          {sale.type === 'bran' && sale.branType && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                              ভুসি: {sale.branType}
                        </span>
                          )}
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      {bosta25 > 0 && <span className="text-sm">{bosta25}×২৫</span>}
                      {bosta25 > 0 && bosta50 > 0 && <span className="text-sm mx-1">+</span>}
                      {bosta50 > 0 && <span className="text-sm">{bosta50}×৫০</span>}
                      <span className="text-xs text-gray-500 ml-1">({totalBosta} টি)</span>
                    </TableCell>
                    <TableCell className="font-medium">{totalKg} কেজি</TableCell>
                    <TableCell className="font-medium">৳{sale.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.saleType === 'cash' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sale.saleType === 'cash' ? 'নগদ' : 'বাকি'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMemo(sale)}
                      >
                        <FileText size={16} className="mr-1" />
                        রশিদ
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
  );
}






















