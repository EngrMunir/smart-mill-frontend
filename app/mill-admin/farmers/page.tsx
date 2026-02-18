'use client';

import { useState, useEffect } from 'react';
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
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { BostaWeightInput } from '@/components/BostaWeightInput';
import { calculateTotalKg } from '@/lib/stockUtils';
import { useToast } from '@/components/ui/toast-simple';

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [paddyPurchases, setPaddyPurchases] = useState<any[]>([]);
  const [currentStock, setCurrentStock] = useState<any>({ paddy: {} });
  const [paddyTypes, setPaddyTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
      const [farmersData, purchasesData, paddyTypesData] = await Promise.all([
        farmersAPI.getAll(),
        paddyAPI.getAllPaddyPurchases(),
        paddyAPI.getAllPaddyTypes()
      ]);
      
      console.log('Raw Farmers data:', farmersData);
      console.log('Raw Purchases data:', purchasesData);
      console.log('Raw Paddy Types data:', paddyTypesData);
      
      // Ensure arrays are always arrays
      const farmersList = Array.isArray(farmersData) ? farmersData : [];
      const purchasesList = Array.isArray(purchasesData) ? purchasesData : [];
      const paddyTypesList = Array.isArray(paddyTypesData) ? paddyTypesData : [];
      
      console.log('Processed Farmers list:', farmersList, 'Length:', farmersList.length);
      console.log('Processed Purchases list:', purchasesList, 'Length:', purchasesList.length);
      console.log('Processed Paddy Types list:', paddyTypesList, 'Length:', paddyTypesList.length);
      
      setFarmers(farmersList);
      setPaddyPurchases(purchasesList);
      setPaddyTypes(paddyTypesList);

      // Fetch paddy stock using /stock/paddy API
      const typeWisePaddy: any = {};
      
      try {
        // Call /stock/paddy API directly (without paddyTypeId to get all stock)
        const allPaddyStock = await stockAPI.getPaddyStock();
        
        // Handle the response format: { paddyTypes: [...] }
        if (allPaddyStock && allPaddyStock.paddyTypes && Array.isArray(allPaddyStock.paddyTypes)) {
          console.log('Processing paddyTypes array from response...');
          for (const stockItem of allPaddyStock.paddyTypes) {
            const paddyTypeName = stockItem.paddyTypeName;
            const totalBostas = stockItem.totalBostas || 0;
            const totalWeight = stockItem.totalWeight || 0;
            const availableStock = stockItem.availableStock || 0;
            
            console.log(`Processing: ${paddyTypeName}, totalBostas: ${totalBostas}, totalWeight: ${totalWeight}, availableStock: ${availableStock}`);
            
            // Only add if there's stock available
            if (availableStock > 0 || totalBostas > 0 || totalWeight > 0) {
              // Calculate kg from totalWeight (totalWeight is in kg)
              // We'll use totalWeight as the kg value
              typeWisePaddy[paddyTypeName] = {
                kg: totalWeight,
                totalBosta: totalBostas,
                bostaSize: totalBostas > 0 ? Math.round(totalWeight / totalBostas) : 50, // Calculate average bosta size
              };
            }
          }
        } else {
          console.log('Unexpected response format:', allPaddyStock);
        }
      } catch (err: any) {
        console.error('Failed to fetch paddy stock from /stock/paddy:', err);
        console.error('Error details:', err.message, err.stack);
      }
      
      console.log('\n=== Final typeWisePaddy object ===');
      console.log(JSON.stringify(typeWisePaddy, null, 2));
      console.log('Object keys:', Object.keys(typeWisePaddy));
      console.log('Number of types with stock:', Object.keys(typeWisePaddy).length);
      
      setCurrentStock({ paddy: typeWisePaddy });
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data');
      // Set empty arrays on error to prevent undefined errors
      setFarmers([]);
      setPaddyPurchases([]);
      setPaddyTypes([]);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: `ডেটা লোড করতে ব্যর্থ হয়েছে: ${err.message || 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFarmer) {
        await farmersAPI.update(editingFarmer.id, formData);
        toast({
          variant: 'success',
          title: 'সফল',
          description: 'কৃষকের তথ্য সফলভাবে আপডেট করা হয়েছে',
        });
      } else {
        await farmersAPI.create(formData);
        toast({
          variant: 'success',
          title: 'সফল',
          description: 'নতুন কৃষক সফলভাবে যোগ করা হয়েছে',
        });
      }
      await fetchData();
      setShowFarmerModal(false);
      setFormData({ name: '', phone: '', address: '' });
      setEditingFarmer(null);
    } catch (err: any) {
      console.error('Farmer save error:', err);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: err.message || 'কৃষক সংরক্ষণ করতে ব্যর্থ হয়েছে',
      });
    }
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseForm.bostas.length === 0) {
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: 'অন্তত একটি বস্তা যোগ করুন',
      });
      return;
    }
    
    if (!purchaseForm.farmerId) {
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: 'কৃষক নির্বাচন করুন',
      });
      return;
    }

    if (!purchaseForm.paddyTypeId && (!paddyTypes || paddyTypes.length === 0)) {
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: 'ধানের ধরন নির্বাচন করুন বা প্রথমে ধানের ধরন যোগ করুন',
      });
      return;
    }
    
    try {
      const paddyTypeId = purchaseForm.paddyTypeId || paddyTypes[0]?.id;

      // Calculate total bosta and total weight from bostas array
      const totalBosta = purchaseForm.bostas.length;
      const totalWeight = purchaseForm.bostas.reduce((sum, b) => sum + parseFloat(b.weightKg.toString() || '0'), 0);
      const pricePerKg = parseFloat(purchaseForm.ratePerKg) || 0;
      const totalPrice = totalWeight * pricePerKg;
      const paidAmount = parseFloat(purchaseForm.paidAmount) || 0;

      await paddyAPI.createPaddyPurchase({
        farmerId: parseInt(purchaseForm.farmerId),
        paddyTypeId: parseInt(paddyTypeId),
        purchaseDate: new Date().toISOString().split('T')[0],
        totalBosta: totalBosta,
        totalWeight: totalWeight,
        pricePerKg: pricePerKg,
        totalPrice: totalPrice,
        paidAmount: paidAmount > 0 ? paidAmount : undefined,
        notes: `Purchase from ${purchaseForm.farmerName}`
      });

      toast({
        variant: 'success',
        title: 'সফল',
        description: 'ধান কেনার রেকর্ড সফলভাবে সংরক্ষণ করা হয়েছে',
      });

      await fetchData();

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
    } catch (err: any) {
      console.error('Purchase save error:', err);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: err.message || 'ধান কেনার রেকর্ড সংরক্ষণ করতে ব্যর্থ হয়েছে',
      });
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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">ডেটা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
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
            const totalBostas = stock.totalBosta || 0;
            const totalWeight = stock.kg || 0;
            
            if (totalBostas === 0 && totalWeight === 0) return null;
            
            return (
              <div key={type} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">{type}</p>
                <p className="text-sm text-blue-700">
                  বস্তা: {totalBostas} টি
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  মোট ওজন: {totalWeight.toFixed(2)} কেজি
                </p>
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
            {farmers && farmers.length > 0 ? (
              farmers.map((farmer) => (
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
            ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  কোনো কৃষক পাওয়া যায়নি
                </TableCell>
              </TableRow>
            )}
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
            {paddyPurchases && paddyPurchases.length > 0 ? (
              paddyPurchases.map((purchase: any) => {
                // Debug logging for first purchase
                if (paddyPurchases.indexOf(purchase) === 0) {
                  console.log('=== Purchase Data Sample (First Item) ===');
                  console.log('Purchase object:', purchase);
                  console.log('totalBosta:', purchase.totalBosta);
                  console.log('totalBostas:', purchase.totalBostas);
                  console.log('totalKg:', purchase.totalKg);
                  console.log('totalWeight:', purchase.totalWeight);
                  console.log('bostas array:', purchase.bostas);
                }
                
                // Backend returns totalBostas (plural) and totalWeight, not totalBosta and totalKg
                const totalKg = parseFloat(purchase.totalWeight) || parseFloat(purchase.totalKg) || 0;
                const totalBosta = parseInt(purchase.totalBostas) || parseInt(purchase.totalBosta) || 0;
                
                return (
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
                    <div className="font-medium">{totalBosta} বস্তা</div>
                    {purchase.bostas && Array.isArray(purchase.bostas) && purchase.bostas.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {purchase.bostas.slice(0, 3).map((b: any, idx: number) => (
                          <span key={idx}>
                            {b.weight || b.weightKg || 0} কেজি{idx < Math.min(2, purchase.bostas.length - 1) ? ', ' : ''}
                          </span>
                        ))}
                        {purchase.bostas.length > 3 && '...'}
                    </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {totalKg.toFixed(2)} কেজি
                </TableCell>
                <TableCell>৳{(parseFloat(purchase.pricePerKg) || 0).toFixed(2)}</TableCell>
                <TableCell className="font-medium">৳{purchase.totalAmount?.toLocaleString() || purchase.totalPrice?.toLocaleString() || '0'}</TableCell>
                <TableCell className="text-green-600">৳{purchase.paidAmount?.toLocaleString() || '0'}</TableCell>
                <TableCell className="text-red-600">৳{purchase.dueAmount?.toLocaleString() || '0'}</TableCell>
              </TableRow>
            )})
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  কোনো কেনার রেকর্ড নেই
                </TableCell>
              </TableRow>
            )}
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
                  {farmers && farmers.length > 0 ? (
                    farmers.map((farmer) => (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.name}
                    </option>
                    ))
                  ) : (
                    <option value="" disabled>কোনো কৃষক নেই</option>
                  )}
                </select>
              </div>
              <div>
                <Label htmlFor="paddyType">ধানের ধরন</Label>
                {paddyTypes && paddyTypes.length > 0 ? (
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
                ) : (
                  <div className="space-y-2">
                    <Input
                      disabled
                      placeholder="কোনো ধানের ধরন নেই"
                      className="bg-gray-50"
                    />
                    <p className="text-sm text-gray-500">প্রথমে ধানের ধরন যোগ করুন</p>
                  </div>
                )}
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
  );
}










