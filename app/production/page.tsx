'use client';

import MainLayout from '@/components/MainLayout';
import { productions, updatePaddyStock, updateRiceStock, updateBranStock, getStock } from '@/lib/sampleData';
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
import { calculateTotalKg, BostaSize, normalizeStock } from '@/lib/stockUtils';
import { PADDY_TYPES, RICE_TYPES, BRAN_TYPES, DEFAULT_BOSTA_SIZE, PaddyType, RiceType, BranType } from '@/lib/constants';

export default function ProductionPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    paddyType: '২৮' as PaddyType,
    customPaddyType: '',
    riceType: 'মিনিকেট' as RiceType,
    customRiceType: '',
    paddyKg: 0,
    paddyBosta: 0,
    riceKg: 0,
    riceBosta: 0,
    riceBostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
    motaBranKg: 0,
    motaBranBosta: 0,
    motaBranBostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
    chikonBranKg: 0,
    chikonBranBosta: 0,
    chikonBranBostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
  });
  const currentStock = getStock();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paddyTotalKg = calculateTotalKg(formData.paddyKg, formData.paddyBosta, 50);
    const riceTotalKg = calculateTotalKg(formData.riceKg, formData.riceBosta, formData.riceBostaSize);
    const motaBranTotalKg = calculateTotalKg(formData.motaBranKg, formData.motaBranBosta, formData.motaBranBostaSize);
    const chikonBranTotalKg = calculateTotalKg(formData.chikonBranKg, formData.chikonBranBosta, formData.chikonBranBostaSize);

    const paddyTypeKey = formData.paddyType === 'অন্যান্য' ? formData.customPaddyType : formData.paddyType;
    const riceTypeKey = formData.riceType === 'অন্যান্য' ? formData.customRiceType : formData.riceType;

    console.log('Production data:', {
      ...formData,
      paddyTotalKg,
      riceTotalKg,
      motaBranTotalKg,
      chikonBranTotalKg,
    });

    // Update stock: reduce paddy (type-wise), increase rice (type-wise) and bran (type-wise)
    const paddyStockQty = normalizeStock(paddyTotalKg, 50);
    updatePaddyStock(paddyTypeKey, paddyStockQty, 'subtract');

    const riceStockQty = normalizeStock(riceTotalKg, formData.riceBostaSize);
    updateRiceStock(riceTypeKey, riceStockQty, 'add');

    const motaBranStockQty = normalizeStock(motaBranTotalKg, formData.motaBranBostaSize);
    updateBranStock('মোটা ভুসি', motaBranStockQty, 'add');

    const chikonBranStockQty = normalizeStock(chikonBranTotalKg, formData.chikonBranBostaSize);
    updateBranStock('চিকন ভুসি', chikonBranStockQty, 'add');

    setShowForm(false);
    setFormData({
      paddyType: '২৮',
      customPaddyType: '',
      riceType: 'মিনিকেট',
      customRiceType: '',
      paddyKg: 0,
      paddyBosta: 0,
      riceKg: 0,
      riceBosta: 0,
      riceBostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
      motaBranKg: 0,
      motaBranBosta: 0,
      motaBranBostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
      chikonBranKg: 0,
      chikonBranBosta: 0,
      chikonBranBostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">উৎপাদন</h1>
            <p className="text-gray-600 mt-1">ধান থেকে চাল ও ভুসি রূপান্তর</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={20} />
            নতুন উৎপাদন
          </Button>
        </div>

        {/* Type-wise Stock Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ধানের স্টক (ধরন অনুযায়ী)</h2>
            <div className="space-y-2">
              {Object.entries(currentStock.paddy).map(([type, stock]) => {
                const totalKg = calculateTotalKg(stock.kg, stock.bosta, stock.bostaSize);
                if (totalKg === 0) return null;
                return (
                  <div key={type} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-amber-900">{type}</p>
                    <p className="text-sm text-amber-700">
                      {stock.bosta} বস্তা + {stock.kg.toFixed(2)} কেজি (মোট: {totalKg.toFixed(2)} কেজি)
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
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
                      {stock.bosta} বস্তা ({stock.bostaSize}কেজি) + {stock.kg.toFixed(2)} কেজি (মোট: {totalKg.toFixed(2)} কেজি)
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Production Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>উৎপাদন এন্ট্রি যোগ করুন</DialogTitle>
              <DialogDescription>
                ধান থেকে চাল ও ভুসি রূপান্তরের রেকর্ড (ধরন অনুযায়ী)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paddyType">ধানের ধরন</Label>
                    <Select
                      value={formData.paddyType}
                      onValueChange={(value) => setFormData({ ...formData, paddyType: value as PaddyType, customPaddyType: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PADDY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.paddyType === 'অন্যান্য' && (
                    <div>
                      <Label htmlFor="customPaddyType">কাস্টম ধানের ধরন</Label>
                      <Input
                        id="customPaddyType"
                        required
                        value={formData.customPaddyType}
                        onChange={(e) => setFormData({ ...formData, customPaddyType: e.target.value })}
                        placeholder="কাস্টম ধানের ধরন লিখুন"
                      />
                    </div>
                  )}
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
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">ইনপুট ধান</h3>
                  <QuantityInput
                    kg={formData.paddyKg}
                    bosta={formData.paddyBosta}
                    bostaSize={50}
                    onKgChange={(kg) => setFormData({ ...formData, paddyKg: kg })}
                    onBostaChange={(bosta) => setFormData({ ...formData, paddyBosta: bosta })}
                    onBostaSizeChange={() => {}}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">আউটপুট চাল</h3>
                  <QuantityInput
                    kg={formData.riceKg}
                    bosta={formData.riceBosta}
                    bostaSize={formData.riceBostaSize}
                    onKgChange={(kg) => setFormData({ ...formData, riceKg: kg })}
                    onBostaChange={(bosta) => setFormData({ ...formData, riceBosta: bosta })}
                    onBostaSizeChange={(size) => setFormData({ ...formData, riceBostaSize: size })}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">আউটপুট ভুসি</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">মোটা ভুসি</h4>
                      <QuantityInput
                        kg={formData.motaBranKg}
                        bosta={formData.motaBranBosta}
                        bostaSize={formData.motaBranBostaSize}
                        onKgChange={(kg) => setFormData({ ...formData, motaBranKg: kg })}
                        onBostaChange={(bosta) => setFormData({ ...formData, motaBranBosta: bosta })}
                        onBostaSizeChange={(size) => setFormData({ ...formData, motaBranBostaSize: size })}
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">চিকন ভুসি</h4>
                      <QuantityInput
                        kg={formData.chikonBranKg}
                        bosta={formData.chikonBranBosta}
                        bostaSize={formData.chikonBranBostaSize}
                        onKgChange={(kg) => setFormData({ ...formData, chikonBranKg: kg })}
                        onBostaChange={(bosta) => setFormData({ ...formData, chikonBranBosta: bosta })}
                        onBostaSizeChange={(size) => setFormData({ ...formData, chikonBranBostaSize: size })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  বাতিল
                </Button>
                <Button type="submit">উৎপাদন সংরক্ষণ করুন</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Production History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">উৎপাদনের ইতিহাস</h2>
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
              {productions.map((production) => {
                const paddyTotalKg = calculateTotalKg(production.paddyKg, production.paddyBosta, 50);
                const riceTotalKg = calculateTotalKg(production.riceKg, production.riceBosta, production.riceBostaSize);
                const motaBranTotalKg = calculateTotalKg(production.motaBranKg, production.motaBranBosta, production.motaBranBostaSize);
                const chikonBranTotalKg = calculateTotalKg(production.chikonBranKg, production.chikonBranBosta, production.chikonBranBostaSize);
                const branTotalKg = motaBranTotalKg + chikonBranTotalKg;
                const riceYield = ((riceTotalKg / paddyTotalKg) * 100).toFixed(2);
                return (
                  <TableRow key={production.id}>
                    <TableCell>{production.date}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {production.paddyType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        {production.riceType}
                      </span>
                    </TableCell>
                    <TableCell>
                      {production.paddyBosta > 0 && `${production.paddyBosta} বস্তা + `}
                      {production.paddyKg > 0 && `${production.paddyKg} কেজি`}
                      <span className="text-muted-foreground ml-1">({paddyTotalKg.toFixed(2)} কেজি)</span>
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {production.riceBosta > 0 && `${production.riceBosta} বস্তা (${production.riceBostaSize}কেজি) + `}
                      {production.riceKg > 0 && `${production.riceKg} কেজি`}
                      <span className="text-muted-foreground ml-1">({riceTotalKg.toFixed(2)} কেজি)</span>
                    </TableCell>
                    <TableCell className="text-yellow-600 font-medium">
                      <div className="text-xs">
                        <div>মোটা: {production.motaBranBosta > 0 && `${production.motaBranBosta} বস্তা (${production.motaBranBostaSize}কেজি) + `}{production.motaBranKg > 0 && `${production.motaBranKg} কেজি`} ({motaBranTotalKg.toFixed(2)} কেজি)</div>
                        <div>চিকন: {production.chikonBranBosta > 0 && `${production.chikonBranBosta} বস্তা (${production.chikonBranBostaSize}কেজি) + `}{production.chikonBranKg > 0 && `${production.chikonBranKg} কেজি`} ({chikonBranTotalKg.toFixed(2)} কেজি)</div>
                        <div className="font-semibold mt-1">মোট: {branTotalKg.toFixed(2)} কেজি</div>
                      </div>
                    </TableCell>
                    <TableCell>{riceYield}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
