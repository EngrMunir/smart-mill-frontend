'use client';

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
import { Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { QuantityInput } from '@/components/QuantityInput';
import { calculateTotalKg, BostaSize } from '@/lib/stockUtils';
import { RICE_TYPES, BRAN_TYPES, DEFAULT_BOSTA_SIZE, RiceType, BranType } from '@/lib/constants';
import { getAllStock, getBranStock, getRiceStock } from '@/services/stock.service';
import { getAllBranTypes, getAllRiceTypes } from '@/services/paddy.service';
import { createPurchase, getAllPurchase } from '@/services/purchase';

export default function ExternalPurchasePage() {
  const [showForm, setShowForm] = useState(false);
  const [riceStock, setRiceStock] = useState<any>({});
  const [riceTypes, setRiceTypes] = useState<any[]>([]);
  const [branStock, setBranStock] = useState<any>({});
  const [branTypes, setBranTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [externalPurchases, setExternalPurchases] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    riceItems: [{
      id: Date.now().toString(),
      riceType: '' as any,
      customRiceType: '',
      quantityKg: 0,
      quantityBosta: 0,
      bostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
      ratePerKg: '',
    }] as Array<{
      id: string;
      riceType: any;
      customRiceType: string;
      quantityKg: number;
      quantityBosta: number;
      bostaSize: BostaSize;
      ratePerKg: string;
    }>,
    branItems: [{
      id: Date.now().toString(),
      branType: '' as any,
      quantityKg: 0,
      quantityBosta: 0,
      bostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
      ratePerKg: '',
    }] as Array<{
      id: string;
      branType: any;
      quantityKg: number;
      quantityBosta: number;
      bostaSize: BostaSize;
      ratePerKg: string;
    }>,
    supplierName: '',
    paidAmount: '',
    notes: '',
  });

  useEffect(() => {
    fetchRiceStock();
    fetchBranStock();
    fetchExternalPurchases();
  }, []);

  const fetchRiceStock = async () => {
    try {
      setLoading(true);
      // Fetch all rice types first
      const riceTypesData = await getAllRiceTypes();
      console.log('Rice Types from API:', riceTypesData);
      const typesList = Array.isArray(riceTypesData) ? riceTypesData : [];
      setRiceTypes(typesList);
      console.log('Rice Types set to state:', typesList);
      
      // Fetch rice stock for each type using individual API calls
      const typeWiseRice: any = {};
      
      console.log('Fetching individual rice stock for each type...');
      for (const riceType of riceTypesData) {
        try {
          console.log(`Fetching stock for rice type: ${riceType.name} (ID: ${riceType.id})`);
          const stock = await getRiceStock(riceType.id);
          
          let totalKg = 0;
          let totalBosta = 0;
          let totalWeight = 0;
          let bostaSize = 50;
          
          if (stock) {
            totalKg = stock.totalKg || stock.total_kg || stock.totalWeight || stock.total_weight || 0;
            totalBosta = stock.totalBosta || stock.total_bosta || stock.bosta || stock.totalBostas || 0;
            totalWeight = stock.totalWeight || stock.total_weight || totalKg || 0;
            bostaSize = stock.bostaSize || stock.bosta_size || riceType.defaultBostaSize || 50;
            
            // If we have totalWeight but not totalKg, use totalWeight
            if (totalKg === 0 && totalWeight > 0) {
              totalKg = totalWeight;
            }
          }
                    
          // Store stock even if it's 0, so we can show all types
          typeWiseRice[riceType.name] = {
            kg: totalKg,
            totalBosta: totalBosta,
            bostaSize: bostaSize,
          };
        } catch (err) {
          console.error(`Failed to fetch stock for rice type ${riceType.name}:`, err);
          // Set empty stock for this type if fetch fails
          typeWiseRice[riceType.name] = {
            kg: 0,
            totalBosta: 0,
            bostaSize: riceType.defaultBostaSize || 50,
          };
        }
      }
            setRiceStock(typeWiseRice);
    } catch (err: any) {
      console.error('Failed to fetch rice stock:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranStock = async () => {
    try {
      // Fetch all bran types first
      const branTypesData = await getAllBranTypes();
      const typesList = Array.isArray(branTypesData) ? branTypesData : [];
      setBranTypes(typesList);
      
      const typeWiseBran: any = {};
      
      const allBranStock = await getBranStock();
      
      if (allBranStock && allBranStock.branTypes && Array.isArray(allBranStock.branTypes)) {
        for (const stockItem of allBranStock.branTypes) {
          const branTypeName = stockItem.branTypeName;
          const totalBostas = stockItem.totalBostas || 0;
          const totalWeight = stockItem.totalWeight || 0;
          const availableStock = stockItem.availableStock || 0;
          
          if (availableStock > 0 || totalBostas > 0 || totalWeight > 0) {
            typeWiseBran[branTypeName] = {
              kg: totalWeight,
              totalBosta: totalBostas,
              bostaSize: totalBostas > 0 ? Math.round(totalWeight / totalBostas) : 50,
            };
          }
        }
      } else if (Array.isArray(allBranStock)) {
        for (const stockItem of allBranStock) {
          const branType = branTypesData.find((bt: any) => 
            bt.id === stockItem.branTypeId || 
            bt.id === stockItem.bran_type_id
          );
          
          if (branType) {
            const totalKg = stockItem.totalKg || stockItem.total_kg || stockItem.totalWeight || stockItem.total_weight || 0;
            const totalBosta = stockItem.totalBosta || stockItem.total_bosta || stockItem.bosta || stockItem.totalBostas || 0;
            const bostaSize = stockItem.bostaSize || stockItem.bosta_size || 50;
            
            if (totalKg > 0 || totalBosta > 0) {
              const kgFromBosta = totalBosta * bostaSize;
              const remainingKg = totalKg - kgFromBosta;
              
              typeWiseBran[branType.name] = {
                kg: remainingKg > 0 ? remainingKg : 0,
                totalBosta: totalBosta,
                bostaSize: bostaSize,
              };
            }
          }
        }
      } else if (allBranStock && typeof allBranStock === 'object') {
        // Response is an object
        for (const [key, stockItem] of Object.entries(allBranStock)) {
          const stock = stockItem as any;
          const totalKg = stock.totalKg || stock.total_kg || stock.totalWeight || stock.total_weight || 0;
          const totalBosta = stock.totalBosta || stock.total_bosta || stock.bosta || stock.totalBostas || 0;
          const bostaSize = stock.bostaSize || stock.bosta_size || 50;
          
          if (totalKg > 0 || totalBosta > 0) {
            const kgFromBosta = totalBosta * bostaSize;
            const remainingKg = totalKg - kgFromBosta;
            
            typeWiseBran[key] = {
              kg: remainingKg > 0 ? remainingKg : 0,
              totalBosta: totalBosta,
              bostaSize: bostaSize,
            };
          }
        }
      }
      
      // If no data from bulk fetch, try individual fetches
      if (Object.keys(typeWiseBran).length === 0 && branTypesData.length > 0) {
        for (const branType of branTypesData) {
          try {
            const stock = await getBranStock(branType.id);
            const totalKg = stock?.totalKg || stock?.total_kg || stock?.totalWeight || stock?.total_weight || 0;
            const totalBosta = stock?.totalBosta || stock?.total_bosta || stock?.bosta || stock?.totalBostas || 0;
            const bostaSize = stock?.bostaSize || stock?.bosta_size || 50;
            
            if (totalKg > 0 || totalBosta > 0) {
              const kgFromBosta = totalBosta * bostaSize;
              const remainingKg = totalKg - kgFromBosta;
              
              typeWiseBran[branType.name] = {
                kg: remainingKg > 0 ? remainingKg : 0,
                totalBosta: totalBosta,
                bostaSize: bostaSize,
              };
            }
          } catch (err) {
            console.error(`Failed to fetch stock for bran type ${branType.name}:`, err);
          }
        }
      }
            setBranStock(typeWiseBran);
    } catch (err: any) {
      console.error('Failed to fetch bran stock:', err);
    }
  };

  const fetchExternalPurchases = async () => {
    try {
      console.log('Fetching external purchases...');
      const purchases = await getAllPurchase();
      setExternalPurchases(purchases || []);
    } catch (err: any) {
      console.error('Failed to fetch external purchases:', err);
      setExternalPurchases([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.supplierName.trim()) {
      alert('সরবরাহকারী / মিলের নাম দিন');
      return;
    }

    const hasRiceItems = formData.riceItems.some(item => item.riceType && item.quantityBosta > 0);
    const hasBranItems = formData.branItems.some(item => item.branType && item.quantityBosta > 0);

    if (!hasRiceItems && !hasBranItems) {
      alert('অন্তত একটি চাল বা ভুসির ধরন যোগ করুন');
      return;
    }
    
    try {
      let totalKg = 0;
      let totalAmount = 0;
      const purchaseDate = new Date().toISOString().split('T')[0];

      // Process all rice items - send to backend
      for (const item of formData.riceItems) {
        if (!item.riceType || item.quantityBosta <= 0) continue;

        const itemTotalKg = calculateTotalKg(item.quantityKg, item.quantityBosta, item.bostaSize);
        const rate = parseFloat(item.ratePerKg) || 0;
        if (rate <= 0) {
          alert(`চালের ধরন "${item.riceType}" এর জন্য দর দিন`);
          return;
        }
        const itemTotalAmount = item.quantityBosta * rate; // Rate per bosta
        
        totalKg += itemTotalKg;
        totalAmount += itemTotalAmount;

        // Find rice type ID from API data
        const riceType = riceTypes.find((rt: any) => rt.name === item.riceType);
        
        if (!riceType) {
          alert(`চালের ধরন "${item.riceType}" পাওয়া যায়নি`);
          return;
        }

        // Prepare data in exact format as specified
        const purchaseData = {
          productType: 'RICE' as const,
          riceTypeId: riceType.id,
          supplierName: formData.supplierName.trim(),
          purchaseDate: purchaseDate,
          bostaQuantity: item.quantityBosta,
          bostaSize: item.bostaSize,
          pricePerBosta: rate, // Rate per bosta (user enters this directly)
          notes: formData.notes.trim() || `External purchase - ${item.riceType}`,
        };
    
        await createPurchase(purchaseData);
      
      }

      // Process all bran items - send to backend
      for (const item of formData.branItems) {
        if (!item.branType || item.quantityBosta <= 0) continue;

        const itemTotalKg = calculateTotalKg(item.quantityKg, item.quantityBosta, item.bostaSize);
        const rate = parseFloat(item.ratePerKg) || 0;
        if (rate <= 0) {
          alert(`ভুসির ধরন "${item.branType}" এর জন্য দর দিন`);
          return;
        }
        const itemTotalAmount = item.quantityBosta * rate; // Rate per bosta
        
        totalKg += itemTotalKg;
        totalAmount += itemTotalAmount;

        // Find bran type ID from API data
        const branType = branTypes.find((bt: any) => bt.name === item.branType);
        
        if (!branType) {
          alert(`ভুসির ধরন "${item.branType}" পাওয়া যায়নি`);
          return;
        }

        // Prepare data in exact format as specified
        const purchaseData = {
          productType: 'BRAN' as const,
          branTypeId: branType.id,
          supplierName: formData.supplierName.trim(),
          purchaseDate: purchaseDate,
          bostaQuantity: item.quantityBosta,
          bostaSize: item.bostaSize,
          pricePerBosta: rate, // Rate per bosta (user enters this directly)
          notes: formData.notes.trim() || `External purchase - ${item.branType}`,
        };

        await createPurchase(purchaseData);

      }

      // Refresh purchase history after successful submission
      await fetchExternalPurchases();

      // const paidAmount = parseFloat(formData.paidAmount) || 0;
      // const dueAmount = totalAmount - paidAmount;

      
      setShowForm(false);
      setFormData({
        riceItems: [{
          id: Date.now().toString(),
          riceType: '' as any,
          customRiceType: '',
          quantityKg: 0,
          quantityBosta: 0,
          bostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
          ratePerKg: '',
        }],
      branItems: [{
        id: Date.now().toString(),
        branType: '' as any,
        quantityKg: 0,
        quantityBosta: 0,
        bostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
        ratePerKg: '',
      }],
      supplierName: '',
      paidAmount: '',
      notes: '',
    });
    } catch (err: any) {
      console.error('❌ Failed to save external purchase:', err);
      alert(`Failed to save: ${err.message || 'Unknown error'}`);
    }
  };

  const calculateTotal = () => {
    const riceTotal = formData.riceItems.reduce((sum, item) => {
      const rate = parseFloat(item.ratePerKg) || 0;
      return sum + (item.quantityBosta * rate); // Rate per bosta
    }, 0);
    
    const branTotal = formData.branItems.reduce((sum, item) => {
      const rate = parseFloat(item.ratePerKg) || 0;
      return sum + (item.quantityBosta * rate); // Rate per bosta
    }, 0);
    
    return riceTotal + branTotal;
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
            {loading ? (
              <p className="text-gray-500">লোড হচ্ছে...</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(riceStock).map(([type, stock]: [string, any]) => {
                  const totalBostas = stock.totalBosta || 0;
                  const totalWeight = stock.kg || 0;
                  
                  if (totalBostas === 0 && totalWeight === 0) return null;
                  
                  return (
                    <div key={type} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-900 mb-2">{type}</p>
                      <p className="text-sm text-green-700">
                        বস্তা: {totalBostas} টি
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        মোট ওজন: {totalWeight.toFixed(2)} কেজি
                      </p>
                    </div>
                  );
                })}
                {Object.keys(riceStock).length === 0 && (
                  <p className="text-gray-500">কোন চালের স্টক নেই</p>
                )}
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ভুসির স্টক (ধরন অনুযায়ী)</h2>
            {loading ? (
              <p className="text-gray-500">লোড হচ্ছে...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(branStock).map(([type, stock]: [string, any]) => {
                  const totalBostas = stock.totalBosta || 0;
                  const totalWeight = stock.kg || 0;
                  
                  if (totalBostas === 0 && totalWeight === 0) return null;
                  
                  return (
                    <div key={type} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-yellow-900 mb-2">{type}</p>
                      <p className="text-sm text-yellow-700">
                        বস্তা: {totalBostas} টি
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        মোট ওজন: {totalWeight.toFixed(2)} কেজি
                      </p>
                    </div>
                  );
                })}
                {Object.keys(branStock).length === 0 && (
                  <p className="text-gray-500">কোন ভুসির স্টক নেই</p>
                )}
              </div>
            )}
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
                  <Label htmlFor="supplier">সরবরাহকারী / মিলের নাম</Label>
                  <Input
                    id="supplier"
                    required
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
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
                            riceType: (riceTypes.length > 0 ? riceTypes[0].name : '') as any,
                            customRiceType: '',
                            quantityKg: 0,
                            quantityBosta: 0,
                            bostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
                            ratePerKg: '',
                          };
                          setFormData({
                            ...formData,
                            riceItems: [...formData.riceItems, newRiceItem],
                          });
                        }}
                      >
                        <Plus size={16} className="mr-1" />
                        চালের ধরন যোগ করুন
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
                                {riceTypes.length > 0 ? (
                                  riceTypes.map((type: any) => (
                                    <SelectItem key={type.id} value={type.name}>
                                      {type.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  RICE_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))
                                )}
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
                          <QuantityInput
                            kg={riceItem.quantityKg}
                            bosta={riceItem.quantityBosta}
                            bostaSize={riceItem.bostaSize}
                            showKg={false}
                            onKgChange={(kg) => {
                              const updatedItems = [...formData.riceItems];
                              updatedItems[index].quantityKg = kg;
                              setFormData({ ...formData, riceItems: updatedItems });
                            }}
                            onBostaChange={(bosta) => {
                              const updatedItems = [...formData.riceItems];
                              updatedItems[index].quantityBosta = bosta;
                              setFormData({ ...formData, riceItems: updatedItems });
                            }}
                            onBostaSizeChange={(size) => {
                              const updatedItems = [...formData.riceItems];
                              updatedItems[index].bostaSize = size;
                              setFormData({ ...formData, riceItems: updatedItems });
                            }}
                          />
                          <div className="flex gap-4 items-end">
                            <div className="flex-1">
                              <Label htmlFor={`rate-${riceItem.id}`}>দর প্রতি বস্তা (৳)</Label>
                              <Input
                                id={`rate-${riceItem.id}`}
                                type="number"
                                required
                                step="0.01"
                                value={riceItem.ratePerKg}
                                onChange={(e) => {
                                  const updatedItems = [...formData.riceItems];
                                  updatedItems[index].ratePerKg = e.target.value;
                                  setFormData({ ...formData, riceItems: updatedItems });
                                }}
                              />
                            </div>
                            <div className="bg-white p-3 rounded border flex items-center gap-2">
                              <span className="text-gray-600 text-sm">মোট টাকা:</span>
                              <span className="font-semibold text-sm">৳{((riceItem.quantityBosta * (parseFloat(riceItem.ratePerKg) || 0))).toLocaleString()}</span>
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
                            branType: (branTypes.length > 0 ? branTypes[0].name : '') as any,
                            quantityKg: 0,
                            quantityBosta: 0,
                            bostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
                            ratePerKg: '',
                          };
                          setFormData({
                            ...formData,
                            branItems: [...formData.branItems, newBranItem],
                          });
                        }}
                      >
                        <Plus size={16} className="mr-1" />
                        ভুসির ধরন যোগ করুন
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
                                {branTypes.length > 0 ? (
                                  branTypes.map((type: any) => (
                                    <SelectItem key={type.id} value={type.name}>
                                      {type.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  BRAN_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <QuantityInput
                            kg={branItem.quantityKg}
                            bosta={branItem.quantityBosta}
                            bostaSize={branItem.bostaSize}
                            showKg={false}
                            onKgChange={(kg) => {
                              const updatedItems = [...formData.branItems];
                              updatedItems[index].quantityKg = kg;
                              setFormData({ ...formData, branItems: updatedItems });
                            }}
                            onBostaChange={(bosta) => {
                              const updatedItems = [...formData.branItems];
                              updatedItems[index].quantityBosta = bosta;
                              setFormData({ ...formData, branItems: updatedItems });
                            }}
                            onBostaSizeChange={(size) => {
                              const updatedItems = [...formData.branItems];
                              updatedItems[index].bostaSize = size;
                              setFormData({ ...formData, branItems: updatedItems });
                            }}
                          />
                          <div className="flex gap-4 items-end">
                            <div className="flex-1">
                              <Label htmlFor={`rate-bran-${branItem.id}`}>দর প্রতি বস্তা (৳)</Label>
                              <Input
                                id={`rate-bran-${branItem.id}`}
                                type="number"
                                required
                                step="0.01"
                                value={branItem.ratePerKg}
                                onChange={(e) => {
                                  const updatedItems = [...formData.branItems];
                                  updatedItems[index].ratePerKg = e.target.value;
                                  setFormData({ ...formData, branItems: updatedItems });
                                }}
                              />
                            </div>
                            <div className="bg-white p-3 rounded border flex items-center gap-2">
                              <span className="text-gray-600 text-sm">মোট টাকা:</span>
                              <span className="font-semibold text-sm">৳{((branItem.quantityBosta * (parseFloat(branItem.ratePerKg) || 0))).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                <div>
                  <Label htmlFor="notes">বিবরণ (ঐচ্ছিক)</Label>
                  <Textarea
                    id="notes"
                    placeholder="কোনো অতিরিক্ত তথ্য বা নোট যোগ করুন..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
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
                <TableHead>ধরন</TableHead>
                <TableHead>সরবরাহকারী</TableHead>
                <TableHead>পরিমাণ</TableHead>
                <TableHead>দর/বস্তা</TableHead>
                <TableHead>মোট টাকা</TableHead>
                <TableHead>বিবরণ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!externalPurchases || externalPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    কোন কেনার রেকর্ড নেই
                  </TableCell>
                </TableRow>
              ) : (
                externalPurchases.map((purchase) => {
                  const productName = purchase.productType === 'RICE' 
                    ? (purchase.riceType?.name || 'N/A')
                    : (purchase.branType?.name || 'N/A');
                  
                  return (
                    <TableRow key={purchase.id}>
                      <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString('bn-BD')}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          purchase.productType === 'RICE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {purchase.productType === 'RICE' ? 'চাল' : 'ভুসি'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          purchase.productType === 'RICE' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {productName}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{purchase.supplierName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{purchase.bostaQuantity} বস্তা ({purchase.bostaSize} কেজি)</span>
                          <span className="text-xs text-gray-500">মোট: {parseFloat(purchase.totalKg).toFixed(2)} কেজি</span>
                        </div>
                      </TableCell>
                      <TableCell>৳{parseFloat(purchase.pricePerBosta).toLocaleString()}</TableCell>
                      <TableCell className="font-medium">৳{parseFloat(purchase.totalAmount).toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-xs truncate" title={purchase.notes || ''}>
                        {purchase.notes || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
  );
}






















