'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { AuthGuard } from '@/components/AuthGuard';
import { farmersAPI, paddyAPI, stockAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BostaWeightInput } from '@/components/BostaWeightInput';
import { calculateTotalKg } from '@/lib/stockUtils';

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [paddyPurchases, setPaddyPurchases] = useState<any[]>([]);
  const [currentStock, setCurrentStock] = useState<any>(null);
  const [paddyTypes, setPaddyTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFarmerModal, setShowFarmerModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [purchaseForm, setPurchaseForm] = useState({
    farmerId: '',
    farmerName: '',
    paddyTypeId: '',
    customPaddyType: '',
    bostas: [] as any[],
    ratePerKg: '',
    paidAmount: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [farmersData, purchasesData, stockData, paddyTypesData] = await Promise.all([
        farmersAPI.getAll(),
        paddyAPI.getAllPaddyPurchases(),
        stockAPI.getAllStock(),
        paddyAPI.getAllPaddyTypes()
      ]);
      setFarmers(farmersData);
      setPaddyPurchases(purchasesData);
      setCurrentStock(stockData);
      setPaddyTypes(paddyTypesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFarmer) {
        await farmersAPI.update(editingFarmer.id, formData);
      } else {
        await farmersAPI.create(formData);
      }
      await fetchData(); // Refresh data
    setShowFarmerModal(false);
    setFormData({ name: '', phone: '', address: '' });
    setEditingFarmer(null);
    } catch (err) {
      console.error('Farmer save error:', err);
      alert('Failed to save farmer');
    }
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseForm.bostas.length === 0) {
      alert('অন্তত একটি বস্তা যোগ করুন');
      return;
    }
    
    try {
      const paddyTypeId = purchaseForm.paddyTypeId || paddyTypes[0]?.id;

      await paddyAPI.createPaddyPurchase({
        farmerId: parseInt(purchaseForm.farmerId),
        paddyTypeId: parseInt(paddyTypeId),
        purchaseDate: new Date().toISOString().split('T')[0],
        bostas: purchaseForm.bostas.map(b => ({
          bostaNumber: b.bostaNo,
          weight: b.weightKg
        })),
        pricePerKg: parseFloat(purchaseForm.ratePerKg),
        notes: `Purchase from ${purchaseForm.farmerName}`
      });

      await fetchData(); // Refresh data

    setShowPurchaseModal(false);
    setPurchaseForm({
      farmerId: '',
      farmerName: '',
        paddyTypeId: '',
      customPaddyType: '',
      bostas: [],
      ratePerKg: '',
      paidAmount: '',
    });
    } catch (err) {
      console.error('Purchase save error:', err);
      alert('Failed to save purchase');
    }
  };

  const calculateTotal = () => {
    const totalKg = purchaseForm.bostas.reduce((sum, b) => sum + b.weightKg, 0);
    const rate = parseFloat(purchaseForm.ratePerKg) || 0;
    return totalKg * rate;
  };

  const calculateDue = () => {
    const total = calculateTotal();
    const paid = parseFloat(purchaseForm.paidAmount) || 0;
    return total - paid;
  };

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <p className="text-gray-600">ডেটা লোড হচ্ছে...</p>
            </div>
          </div>
        </MainLayout>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">কৃষক ও ধান কেনা</h1>
            <p className="text-gray-600 mt-1">কৃষক ও ধান কেনার ব্যবস্থাপনা</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setEditingFarmer(null);
                setFormData({ name: '', phone: '', address: '' });
                setShowFarmerModal(true);
              }}
            >
              <Plus size={20} />
              কৃষক যোগ করুন
            </Button>
            <Button
              onClick={() => setShowPurchaseModal(true)}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus size={20} />
              নতুন কেনা
            </Button>
          </div>
        </div>

        {/* Type-wise Stock Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">বর্তমান ধানের স্টক (ধরন অনুযায়ী)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(currentStock?.paddy || {}).map(([type, stock]: [string, any]) => {
              const totalKg = calculateTotalKg(stock.kg, stock.totalBosta, stock.bostaSize || 50);
              if (totalKg === 0) return null;
              return (
                <div key={type} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">{type}</p>
                  <p className="text-sm text-blue-700">
                    {stock.totalBosta} বস্তা + {stock.kg.toFixed(2)} কেজি
                  </p>
                  <p className="text-xs text-blue-600 mt-1">মোট: {totalKg.toFixed(2)} কেজি</p>
                </div>
              );
            })}
            {Object.keys(currentStock?.paddy || {}).length === 0 && (
              <p className="text-gray-500">কোন ধানের স্টক নেই</p>
            )}
          </div>
        </div>

        {/* Farmers Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">কৃষক তালিকা</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>নাম</TableHead>
                <TableHead>ফোন</TableHead>
                <TableHead>ঠিকানা</TableHead>
                <TableHead>মোট কেনা</TableHead>
                <TableHead>মোট বাকি</TableHead>
                <TableHead className="text-right">কর্ম</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmers.map((farmer) => (
                <TableRow key={farmer.id}>
                  <TableCell className="font-medium">{farmer.name}</TableCell>
                  <TableCell>{farmer.phone}</TableCell>
                  <TableCell>{farmer.address}</TableCell>
                  <TableCell>{farmer.totalPurchased} কেজি</TableCell>
                  <TableCell>৳{farmer.totalDue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingFarmer(farmer);
                          setFormData({
                            name: farmer.name,
                            phone: farmer.phone,
                            address: farmer.address,
                          });
                          setShowFarmerModal(true);
                        }}
                      >
                        <Edit size={18} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 size={18} className="text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Purchase History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">কেনার ইতিহাস</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>তারিখ</TableHead>
                <TableHead>কৃষক</TableHead>
                <TableHead>ধানের ধরন</TableHead>
                <TableHead>বস্তার বিবরণ</TableHead>
                <TableHead>মোট কেজি</TableHead>
                <TableHead>দর/কেজি</TableHead>
                <TableHead>মোট টাকা</TableHead>
                <TableHead>পরিশোধ</TableHead>
                <TableHead>বাকি</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paddyPurchases.map((purchase: any) => (
                <TableRow key={purchase.id}>
                  <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString('bn-BD')}</TableCell>
                  <TableCell className="font-medium">{purchase.farmer?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {purchase.paddyType?.name || 'Unknown'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{purchase.totalBosta} বস্তা</div>
                      <div className="text-xs text-gray-500">
                        {purchase.bostas.slice(0, 3).map((b: any) => `${b.weight}কেজি`).join(', ')}
                        {purchase.bostas.length > 3 && '...'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{purchase.totalKg.toFixed(2)} কেজি</TableCell>
                  <TableCell>৳{purchase.pricePerKg}</TableCell>
                  <TableCell className="font-medium">৳{purchase.totalAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">৳{purchase.paidAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-red-600">৳{purchase.dueAmount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Farmer Dialog */}
        <Dialog open={showFarmerModal} onOpenChange={setShowFarmerModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFarmer ? 'কৃষক সম্পাদনা' : 'নতুন কৃষক যোগ করুন'}</DialogTitle>
              <DialogDescription>
                {editingFarmer ? 'কৃষকের তথ্য আপডেট করুন' : 'সিস্টেমে নতুন কৃষক যোগ করুন'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFarmerSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">নাম</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">ফোন</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="address">ঠিকানা</Label>
                  <Textarea
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowFarmerModal(false)}>
                  বাতিল
                </Button>
                <Button type="submit">{editingFarmer ? 'আপডেট' : 'যোগ করুন'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Purchase Form Dialog */}
        <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>নতুন ধান কেনা</DialogTitle>
              <DialogDescription>
                কৃষকের কাছ থেকে নতুন ধান কেনার রেকর্ড (প্রতিটি বস্তার ওজন আলাদা)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePurchaseSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="farmer">কৃষক</Label>
                  <select
                    id="farmer"
                    required
                    value={purchaseForm.farmerId}
                    onChange={(e) => {
                      const farmer = farmers.find(f => f.id === e.target.value);
                      setPurchaseForm({
                        ...purchaseForm,
                        farmerId: e.target.value,
                        farmerName: farmer?.name || '',
                      });
                    }}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">কৃষক নির্বাচন করুন</option>
                    {farmers.map((farmer) => (
                      <option key={farmer.id} value={farmer.id}>
                        {farmer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="paddyType">ধানের ধরন</Label>
                  <Select
                    value={purchaseForm.paddyTypeId}
                    onValueChange={(value) => setPurchaseForm({ ...purchaseForm, paddyTypeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ধানের ধরন নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {paddyTypes.map((type: any) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <BostaWeightInput
                  bostas={purchaseForm.bostas}
                  onBostasChange={(bostas) => setPurchaseForm({ ...purchaseForm, bostas })}
                />
                <div>
                  <Label htmlFor="rate">দর প্রতি কেজি (৳)</Label>
                  <Input
                    id="rate"
                    type="number"
                    required
                    step="0.01"
                    value={purchaseForm.ratePerKg}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, ratePerKg: e.target.value })}
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
                    value={purchaseForm.paidAmount}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, paidAmount: e.target.value })}
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
                <Button type="button" variant="outline" onClick={() => setShowPurchaseModal(false)}>
                  বাতিল
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  কেনা সংরক্ষণ করুন
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
    </AuthGuard>
  );
}
