'use client';

import { externalPurchases, updateRiceStock, updateBranStock, getStock } from '@/lib/sampleData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { QuantityInput } from '@/components/QuantityInput';
import { calculateTotalKg, normalizeStock, BostaSize } from '@/lib/stockUtils';
import { RICE_TYPES, BRAN_TYPES, DEFAULT_BOSTA_SIZE, RiceType, BranType } from '@/lib/constants';

export default function ExternalPurchasePage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productType: 'rice' as 'rice' | 'bran',
    riceType: 'মিনিকেট' as RiceType,
    customRiceType: '',
    branType: 'মোটা ভুসি' as BranType,
    supplierName: '',
    quantityKg: 0,
    quantityBosta: 0,
    bostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
    ratePerKg: '',
    paidAmount: '',
  });
  const currentStock = getStock();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalKg = calculateTotalKg(formData.quantityKg, formData.quantityBosta, formData.bostaSize);
    const rate = parseFloat(formData.ratePerKg);
    const totalAmount = totalKg * rate;
    const paidAmount = parseFloat(formData.paidAmount);
    const dueAmount = totalAmount - paidAmount;

    console.log('External purchase data:', {
      ...formData,
      totalKg,
      totalAmount,
      dueAmount,
    });

    // Update stock
    if (formData.productType === 'rice') {
      const riceTypeKey = formData.riceType === 'অন্যান্য' ? formData.customRiceType : formData.riceType;
      const stockQty = normalizeStock(totalKg, formData.bostaSize);
      updateRiceStock(riceTypeKey, stockQty, 'add');
    } else {
      const stockQty = normalizeStock(totalKg, formData.bostaSize);
      updateBranStock(formData.branType, stockQty, 'add');
    }

    setShowForm(false);
    setFormData({
      productType: 'rice',
      riceType: 'মিনিকেট',
      customRiceType: '',
      branType: 'মোটা ভুসি',
      supplierName: '',
      quantityKg: 0,
      quantityBosta: 0,
      bostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
      ratePerKg: '',
      paidAmount: '',
    });
  };

  const calculateTotal = () => {
    const totalKg = calculateTotalKg(formData.quantityKg, formData.quantityBosta, formData.bostaSize);
    const rate = parseFloat(formData.ratePerKg) || 0;
    return totalKg * rate;
  };

  const calculateDue = () => {
    const total = calculateTotal();
    const paid = parseFloat(formData.paidAmount) || 0;
    return total - paid;
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">বাইরের কেনা</h1>
            <p className="text-gray-600 mt-1">অন্য মিল থেকে চাল বা ভুসি কেনা</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={20} />
            নতুন কেনা
          </Button>
        </div>

        {/* Stock Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">চালের স্টক (ধরন অনুযায়ী)</h2>
            <div className="space-y-2">
              {Object.entries(currentStock.rice).map(([type, stock]) => {
                const totalKg = calculateTotalKg(stock.kg, stock.bosta, stock.bostaSize);
                if (totalKg === 0) return null;
                return (
                  <div key={type} className="bg-green-50 border border-green-200 rounded-lg p-3">
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ভুসির স্টক (ধরন অনুযায়ী)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(currentStock.bran).map(([type, stock]) => {
                const totalKg = calculateTotalKg(stock.kg, stock.bosta, stock.bostaSize);
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
        </div>

        {/* Purchase Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>নতুন বাইরের কেনা</DialogTitle>
              <DialogDescription>
                অন্য মিল থেকে চাল বা ভুসি কেনার রেকর্ড করুন
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="productType">পণ্যের ধরন</Label>
                  <Select
                    value={formData.productType}
                    onValueChange={(value) => setFormData({ ...formData, productType: value as 'rice' | 'bran' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rice">চাল</SelectItem>
                      <SelectItem value="bran">ভুসি</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.productType === 'rice' && (
                  <>
                    <div>
                      <Label htmlFor="riceType">চালের ধরন</Label>
                      <Select
                        value={formData.riceType}
                        onValueChange={(value) => setFormData({ ...formData, riceType: value as RiceType, customRiceType: '' })}
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
                    {formData.riceType === 'অন্যান্য' && (
                      <div>
                        <Label htmlFor="customRiceType">কাস্টম চালের ধরন</Label>
                        <Input
                          id="customRiceType"
                          required
                          value={formData.customRiceType}
                          onChange={(e) => setFormData({ ...formData, customRiceType: e.target.value })}
                          placeholder="কাস্টম চালের ধরন লিখুন"
                        />
                      </div>
                    )}
                  </>
                )}
                {formData.productType === 'bran' && (
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
                )}
                <div>
                  <Label htmlFor="supplier">সরবরাহকারী / মিলের নাম</Label>
                  <Input
                    id="supplier"
                    required
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  />
                </div>
                <QuantityInput
                  kg={formData.quantityKg}
                  bosta={formData.quantityBosta}
                  bostaSize={formData.bostaSize}
                  onKgChange={(kg) => setFormData({ ...formData, quantityKg: kg })}
                  onBostaChange={(bosta) => setFormData({ ...formData, quantityBosta: bosta })}
                  onBostaSizeChange={(size) => setFormData({ ...formData, bostaSize: size })}
                />
                <div>
                  <Label htmlFor="rate">দর প্রতি কেজি (৳)</Label>
                  <Input
                    id="rate"
                    type="number"
                    required
                    step="0.01"
                    value={formData.ratePerKg}
                    onChange={(e) => setFormData({ ...formData, ratePerKg: e.target.value })}
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">মোট টাকা:</span>
                    <span className="font-semibold">৳{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
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
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">বাকি টাকা:</span>
                    <span className="font-bold text-red-600">৳{calculateDue().toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  বাতিল
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  কেনা সংরক্ষণ করুন
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Purchase History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">কেনার ইতিহাস</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>তারিখ</TableHead>
                <TableHead>পণ্য</TableHead>
                <TableHead>চালের ধরন</TableHead>
                <TableHead>সরবরাহকারী</TableHead>
                <TableHead>পরিমাণ</TableHead>
                <TableHead>দর/কেজি</TableHead>
                <TableHead>মোট টাকা</TableHead>
                <TableHead>পরিশোধ</TableHead>
                <TableHead>বাকি</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {externalPurchases.map((purchase) => {
                const totalKg = calculateTotalKg(purchase.quantityKg, purchase.quantityBosta, purchase.bostaSize);
                return (
                  <TableRow key={purchase.id}>
                    <TableCell>{purchase.date}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        purchase.productType === 'rice' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {purchase.productType === 'rice' ? 'চাল' : 'ভুসি'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {purchase.riceType && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {purchase.riceType}
                        </span>
                      )}
                      {purchase.branType && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                          {purchase.branType}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{purchase.supplierName}</TableCell>
                    <TableCell>
                      {purchase.quantityBosta > 0 && `${purchase.quantityBosta} বস্তা (${purchase.bostaSize}কেজি) + `}
                      {purchase.quantityKg > 0 && `${purchase.quantityKg} কেজি`}
                      <span className="text-muted-foreground ml-1">({totalKg.toFixed(2)} কেজি)</span>
                    </TableCell>
                    <TableCell>৳{purchase.ratePerKg}</TableCell>
                    <TableCell className="font-medium">৳{purchase.totalAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">৳{purchase.paidAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">৳{purchase.dueAmount.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
  );
}





