'use client';

import { sales, updateBranStock, getStock } from '@/lib/sampleData';
import { DEFAULT_BOSTA_SIZE, BRAN_TYPES, BranType } from '@/lib/constants';
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
import { Plus, Printer, FileText } from 'lucide-react';
import { useState } from 'react';
import { calculateTotalKg as calcTotalKg, normalizeStock, BostaSize } from '@/lib/stockUtils';
import { MILL_INFO } from '@/lib/constants';

export default function BranSalesPage() {
  const [showForm, setShowForm] = useState(false);
  const [showMemo, setShowMemo] = useState<any>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    branType: 'মোটা ভুসি' as BranType,
    bosta25: 0, // Number of 25kg bags
    bosta50: 0, // Number of 50kg bags
    ratePerKg25: '', // Price per KG for 25kg bags
    ratePerKg50: '', // Price per KG for 50kg bags
    saleType: 'cash' as 'cash' | 'due',
    paidAmount: '',
  });
  const currentStock = getStock();

  const branSales = sales.filter(s => s.type === 'bran');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Calculate according to formula
    const totalKg25 = formData.bosta25 * 25;
    const totalKg50 = formData.bosta50 * 50;
    const totalKg = totalKg25 + totalKg50;
    
    const ratePerKg25 = parseFloat(formData.ratePerKg25) || 0;
    const ratePerKg50 = parseFloat(formData.ratePerKg50) || 0;
    
    const amount25 = totalKg25 * ratePerKg25;
    const amount50 = totalKg50 * ratePerKg50;
    const totalAmount = amount25 + amount50;
    
    const paidAmount = formData.saleType === 'cash' ? totalAmount : parseFloat(formData.paidAmount);
    const dueAmount = totalAmount - paidAmount;

    const newSale = {
      id: Date.now().toString(),
      type: 'bran' as const,
      branType: formData.branType,
      customerName: formData.customerName,
      bosta25: formData.bosta25,
      bosta50: formData.bosta50,
      ratePerKg25,
      ratePerKg50,
      totalKg25,
      totalKg50,
      totalKg,
      amount25,
      amount50,
      totalAmount,
      saleType: formData.saleType,
      paidAmount,
      dueAmount,
      date: new Date().toISOString().split('T')[0],
    };

    console.log('Sale data:', newSale);

    // Update stock: reduce bran (type-wise)
    // Deduct 25kg bags
    if (formData.bosta25 > 0) {
      const stockQty25 = normalizeStock(formData.bosta25 * 25, 25);
      updateBranStock(formData.branType, stockQty25, 'subtract');
    }
    // Deduct 50kg bags
    if (formData.bosta50 > 0) {
      const stockQty50 = normalizeStock(formData.bosta50 * 50, 50);
      updateBranStock(formData.branType, stockQty50, 'subtract');
    }

    setShowMemo(newSale);
    setShowForm(false);
    setFormData({
      customerName: '',
      branType: 'মোটা ভুসি',
      bosta25: 0,
      bosta50: 0,
      ratePerKg25: '',
      ratePerKg50: '',
      saleType: 'cash',
      paidAmount: '',
    });
  };

  const calculateTotal = () => {
    const totalKg25 = formData.bosta25 * 25;
    const totalKg50 = formData.bosta50 * 50;
    const ratePerKg25 = parseFloat(formData.ratePerKg25) || 0;
    const ratePerKg50 = parseFloat(formData.ratePerKg50) || 0;
    const amount25 = totalKg25 * ratePerKg25;
    const amount50 = totalKg50 * ratePerKg50;
    return amount25 + amount50;
  };

  const calculateTotalKg = () => {
    return (formData.bosta25 * 25) + (formData.bosta50 * 50);
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
            <h1 className="text-3xl font-bold text-gray-900">ভুসি বিক্রি</h1>
            <p className="text-gray-600 mt-1">ভুসি বিক্রি ব্যবস্থাপনা ও নগদ রশিদ তৈরি করুন</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={20} />
            নতুন বিক্রি
          </Button>
        </div>

        {/* Stock Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">বর্তমান ভুসির স্টক (ধরন অনুযায়ী)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {Object.keys(currentStock.bran).length === 0 && (
              <p className="text-gray-500">কোন ভুসির স্টক নেই</p>
            )}
          </div>
        </div>

        {/* Sales Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>নতুন ভুসি বিক্রি</DialogTitle>
              <DialogDescription>
                নতুন ভুসি বিক্রির রেকর্ড করুন
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
                  <Label htmlFor="branType">ভুসির ধরন</Label>
                  <Select
                    value={formData.branType}
                    onValueChange={(value) => setFormData({ ...formData, branType: value as BranType })}
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
                <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900">বস্তা বিক্রি (শুধুমাত্র বস্তা হিসেবে)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bosta25">২৫ কেজি বস্তা সংখ্যা</Label>
                      <Input
                        id="bosta25"
                        type="number"
                        min="0"
                        value={formData.bosta25}
                        onChange={(e) => setFormData({ ...formData, bosta25: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rate25">২৫ কেজি প্রতি কেজির দাম (৳)</Label>
                      <Input
                        id="rate25"
                        type="number"
                        step="0.01"
                        value={formData.ratePerKg25}
                        onChange={(e) => setFormData({ ...formData, ratePerKg25: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bosta50">৫০ কেজি বস্তা সংখ্যা</Label>
                      <Input
                        id="bosta50"
                        type="number"
                        min="0"
                        value={formData.bosta50}
                        onChange={(e) => setFormData({ ...formData, bosta50: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rate50">৫০ কেজি প্রতি কেজির দাম (৳)</Label>
                  <Input
                        id="rate50"
                    type="number"
                    step="0.01"
                        value={formData.ratePerKg50}
                        onChange={(e) => setFormData({ ...formData, ratePerKg50: e.target.value })}
                        placeholder="0.00"
                  />
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">২৫ কেজি মোট কেজি:</span>
                      <span className="font-semibold">{formData.bosta25 * 25} কেজি</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">৫০ কেজি মোট কেজি:</span>
                      <span className="font-semibold">{formData.bosta50 * 50} কেজি</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-1">
                      <span className="text-gray-600">মোট কেজি:</span>
                      <span className="font-semibold">{calculateTotalKg()} কেজি</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">মোট বস্তা:</span>
                      <span className="font-semibold">{formData.bosta25 + formData.bosta50} টি</span>
                    </div>
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
                    <span className="text-gray-600">মোট কেজি:</span>
                    <span className="font-semibold">{calculateTotalKg()} কেজি</span>
                  </div>
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
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>নগদ রশিদ</span>
                  <Button variant="ghost" size="icon" onClick={() => window.print()}>
                    <Printer size={20} />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <div className="border-2 border-gray-300 p-6 space-y-4 print:border-black">
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
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>পণ্য:</span>
                    <span className="font-medium">ভুসি</span>
                  </div>
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
                        <span>২৫ কেজি প্রতি কেজির দাম:</span>
                        <span className="font-medium">৳{showMemo.ratePerKg25}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>২৫ কেজি মোট টাকা:</span>
                        <span className="font-medium">৳{showMemo.amount25?.toLocaleString() || ((showMemo.bosta25 * 25 * showMemo.ratePerKg25).toLocaleString())}</span>
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
                        <span>৫০ কেজি প্রতি কেজির দাম:</span>
                        <span className="font-medium">৳{showMemo.ratePerKg50}</span>
                  </div>
                  <div className="flex justify-between">
                        <span>৫০ কেজি মোট টাকা:</span>
                        <span className="font-medium">৳{showMemo.amount50?.toLocaleString() || ((showMemo.bosta50 * 50 * showMemo.ratePerKg50).toLocaleString())}</span>
                  </div>
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
                <TableHead>ভুসির ধরন</TableHead>
                <TableHead>পরিমাণ</TableHead>
                <TableHead>দর/কেজি</TableHead>
                <TableHead>মোট টাকা</TableHead>
                <TableHead>ধরন</TableHead>
                <TableHead className="text-right">কর্ম</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branSales.map((sale) => {
                const bosta25 = sale.bosta25 || 0;
                const bosta50 = sale.bosta50 || 0;
                const totalBosta = bosta25 + bosta50;
                const totalKg = sale.totalKg || ((bosta25 * 25) + (bosta50 * 50));
                return (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell className="font-medium">{sale.customerName}</TableCell>
                    <TableCell>
                      {sale.branType && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                          {sale.branType}
                        </span>
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
