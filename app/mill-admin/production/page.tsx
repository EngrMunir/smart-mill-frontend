'use client';

import { useState, useEffect } from 'react';
import { productionAPI, stockAPI, paddyAPI } from '@/lib/api';
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
import { Plus, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { QuantityInput } from '@/components/QuantityInput';
import { calculateTotalKg, BostaSize } from '@/lib/stockUtils';
import { DEFAULT_BOSTA_SIZE } from '@/lib/constants';
import { useToast } from '@/components/ui/toast-simple';

export default function ProductionPage() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [currentStock, setCurrentStock] = useState<any>(null);
  const [paddyTypes, setPaddyTypes] = useState<any[]>([]);
  const [riceTypes, setRiceTypes] = useState<any[]>([]);
  const [branTypes, setBranTypes] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    paddyTypeId: '',
    productionDate: new Date().toISOString().split('T')[0],
    paddyKg: 0,
    paddyBosta: 0,
    riceOutputs: [{
      id: Date.now().toString(),
      riceTypeId: '',
      riceKg: 0,
      riceBosta: 0,
      riceBostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
    }] as Array<{
      id: string;
      riceTypeId: string;
      riceKg: number;
      riceBosta: number;
      riceBostaSize: BostaSize;
    }>,
    branOutputs: [{
      id: Date.now().toString(),
      branTypeId: '',
      branBosta: 0,
      branBostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
    }] as Array<{
      id: string;
      branTypeId: string;
      branBosta: number;
      branBostaSize: BostaSize;
    }>,
    batchNumber: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [batchesData, stockData, paddyTypesData, riceTypesData, branTypesData] = await Promise.all([
        productionAPI.getAllBatches(),
        stockAPI.getAllStock(),
        paddyAPI.getAllPaddyTypes(),
        paddyAPI.getAllRiceTypes(),
        paddyAPI.getAllBranTypes(),
      ]);


      const batchesList = Array.isArray(batchesData) ? batchesData : [];
      const paddyTypesList = Array.isArray(paddyTypesData) ? paddyTypesData : [];
      const riceTypesList = Array.isArray(riceTypesData) ? riceTypesData : [];
      const branTypesList = Array.isArray(branTypesData) ? branTypesData : [];

      // Process stock data - handle different response formats
      let processedStock: any = { paddy: {}, rice: {}, bran: {} };
      
      // Fetch paddy stock using /stock/paddy API (same approach as farmers page)
        const typeWisePaddy: any = {};
      
      try {
        // Call /stock/paddy API directly (without paddyTypeId to get all stock)
        const allPaddyStock = await stockAPI.getPaddyStock();

        // Handle the response format: { paddyTypes: [...] }
        if (allPaddyStock && allPaddyStock.paddyTypes && Array.isArray(allPaddyStock.paddyTypes)) {
          for (const stockItem of allPaddyStock.paddyTypes) {
            const paddyTypeName = stockItem.paddyTypeName;
            const totalBostas = stockItem.totalBostas || 0;
            const totalWeight = stockItem.totalWeight || 0;
            const availableStock = stockItem.availableStock || 0;
            
            // Only add if there's stock available
            if (availableStock > 0 || totalBostas > 0 || totalWeight > 0) {
              // Use totalWeight as the kg value (same as farmers page)
              typeWisePaddy[paddyTypeName] = {
                kg: totalWeight,
                totalBosta: totalBostas,
                bostaSize: totalBostas > 0 ? Math.round(totalWeight / totalBostas) : 50, // Calculate average bosta size
              };
            }
            }
        }
      } catch (err: any) {
        }

      // Fetch rice stock - only using /stock/rice without parameter
      const typeWiseRice: any = {};
      
      try {
        console.log('=== Calling /stock/rice API (WITHOUT riceTypeId parameter) ===');
        console.log('API URL: http://localhost:3000/stock/rice');
        const allRiceStock = await stockAPI.getRiceStock();
        console.log('=== Response from http://localhost:3000/stock/rice ===');
        console.log('Response Type:', typeof allRiceStock);
        console.log('Is Array?', Array.isArray(allRiceStock));
        console.log('Response Keys:', allRiceStock ? Object.keys(allRiceStock) : 'null');
        console.log('Full Response (JSON):', JSON.stringify(allRiceStock, null, 2));
        console.log('Full Response (Object):', allRiceStock);
        
        // Handle different response formats
        if (allRiceStock && allRiceStock.riceTypes && Array.isArray(allRiceStock.riceTypes)) {
          // Format: { riceTypes: [...] }
          console.log('Response has riceTypes array with', allRiceStock.riceTypes.length, 'items');
          for (const stockItem of allRiceStock.riceTypes) {
            const riceTypeName = stockItem.riceTypeName || stockItem.name || stockItem.riceType?.name;
            const totalBostas = stockItem.currentBostaStock || stockItem.totalBostas || 0;
            const totalWeight = stockItem.currentStock || stockItem.totalWeight || stockItem.availableStock || 0;
            const availableStock = stockItem.currentStock || stockItem.availableStock || 0;
            
            if (riceTypeName) {
              // Only add if there's stock available
              if (availableStock > 0 || totalBostas > 0 || totalWeight > 0) {
                typeWiseRice[riceTypeName] = {
                  kg: totalWeight || availableStock,
                  totalBosta: totalBostas,
                  bostaSize: totalBostas > 0 && totalWeight > 0 ? Math.round(totalWeight / totalBostas) : 50,
                };
              }
            }
          }
        } else if (Array.isArray(allRiceStock)) {
          // Format: [ {...}, {...} ]
          console.log('Response is an array with', allRiceStock.length, 'items');
          for (const stockItem of allRiceStock) {
            const riceTypeName = stockItem.riceTypeName || stockItem.name || stockItem.riceType?.name;
            const totalBostas = stockItem.currentBostaStock || stockItem.totalBostas || 0;
            const totalWeight = stockItem.currentStock || stockItem.totalWeight || stockItem.availableStock || 0;
            const availableStock = stockItem.currentStock || stockItem.availableStock || 0;
            
            if (riceTypeName) {
              // Only add if there's stock available
              if (availableStock > 0 || totalBostas > 0 || totalWeight > 0) {
                typeWiseRice[riceTypeName] = {
                  kg: totalWeight || availableStock,
                  totalBosta: totalBostas,
                  bostaSize: totalBostas > 0 && totalWeight > 0 ? Math.round(totalWeight / totalBostas) : 50,
                };
              }
            }
          }
        } else if (allRiceStock && typeof allRiceStock === 'object') {
          // Format: { type1: {...}, type2: {...} } or single object
          console.log('Response is an object, processing...');
          // Try to match with rice types list
          for (const riceType of riceTypesList) {
            const stockData = allRiceStock[riceType.name] || allRiceStock[riceType.id];
            if (stockData) {
              const totalBostas = stockData.currentBostaStock || stockData.totalBostas || 0;
              const totalWeight = stockData.currentStock || stockData.totalWeight || stockData.availableStock || 0;
              const availableStock = stockData.currentStock || stockData.availableStock || 0;
              
              if (availableStock > 0 || totalBostas > 0 || totalWeight > 0) {
                typeWiseRice[riceType.name] = {
                  kg: totalWeight || availableStock,
                  totalBosta: totalBostas,
                  bostaSize: totalBostas > 0 && totalWeight > 0 ? Math.round(totalWeight / totalBostas) : riceType.defaultBostaSize || 50,
                };
              }
            }
          }
        } else {
          console.log('Unexpected response format:', allRiceStock);
        }
      } catch (err) {
        console.error('Failed to fetch rice stock from /stock/rice:', err);
      }

      // Fetch bran stock for each type
      const typeWiseBran: any = {};
        for (const branType of branTypesList) {
          try {
            const branStock = await stockAPI.getBranStock(branType.id);
          if (branStock) {
            // Handle different field names
            const totalKg = branStock.totalKg || branStock.total_kg || branStock.totalWeight || branStock.total_weight || 0;
            const totalBosta = branStock.totalBosta || branStock.total_bosta || branStock.bosta || branStock.totalBostas || 0;
            
            if (totalKg > 0 || totalBosta > 0) {
              typeWiseBran[branType.name] = {
                kg: totalKg,
                totalBosta: totalBosta,
                bostaSize: branStock.bostaSize || branStock.bosta_size || branType.defaultBostaSize || 50,
              };
            }
            }
          } catch (err) {
          }
        }

        processedStock = {
          paddy: typeWisePaddy,
          rice: typeWiseRice,
          bran: typeWiseBran,
        };

      setBatches(batchesList);
      setCurrentStock(processedStock);
      setPaddyTypes(paddyTypesList);
      setRiceTypes(riceTypesList);
      setBranTypes(branTypesList);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      setBatches([]);
      setPaddyTypes([]);
      setRiceTypes([]);
      setBranTypes([]);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: `ডেটা লোড করতে ব্যর্থ হয়েছে: ${err.message || 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.paddyTypeId) {
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: 'ধানের ধরন নির্বাচন করুন',
      });
      return;
    }

    const paddyTotalKg = calculateTotalKg(formData.paddyKg, formData.paddyBosta, 50);
    if (paddyTotalKg <= 0) {
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: 'ইনপুট ধানের পরিমাণ দিন',
      });
      return;
    }

    // Prepare rice outputs array
    const riceOutputs: Array<{
      riceTypeId: number;
      bostaQuantity: number;
      bostaSize: number;
    }> = [];

    formData.riceOutputs.forEach((riceOutput) => {
      if (riceOutput.riceTypeId && (riceOutput.riceBosta > 0 || riceOutput.riceKg > 0)) {
        riceOutputs.push({
          riceTypeId: parseInt(riceOutput.riceTypeId),
          bostaQuantity: riceOutput.riceBosta,
          bostaSize: riceOutput.riceBostaSize,
        });
      }
    });

    // Prepare bran outputs array
    const branOutputs: Array<{
      branTypeId: number;
      bostaQuantity: number;
      bostaSize: number;
    }> = [];

    formData.branOutputs.forEach((branOutput) => {
      if (branOutput.branTypeId && branOutput.branBosta > 0) {
        branOutputs.push({
          branTypeId: parseInt(branOutput.branTypeId),
          bostaQuantity: branOutput.branBosta,
          bostaSize: branOutput.branBostaSize,
        });
      }
    });

    if (riceOutputs.length === 0 && branOutputs.length === 0) {
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: 'অন্তত একটি আউটপুট (চাল বা ভুসি) যোগ করুন',
      });
      return;
    }

    try {
      await productionAPI.createBatch({
        paddyTypeId: parseInt(formData.paddyTypeId),
        productionDate: formData.productionDate,
        totalWeight: paddyTotalKg,
        totalBosta: formData.paddyBosta,
        riceOutputs,
        branOutputs,
        batchNumber: formData.batchNumber || `BATCH-${Date.now()}`,
        notes: formData.notes,
      });

      toast({
        variant: 'success',
        title: 'সফল',
        description: 'উৎপাদন ব্যাচ সফলভাবে তৈরি করা হয়েছে',
      });

      await fetchData();
      setShowForm(false);
      setFormData({
        paddyTypeId: '',
        productionDate: new Date().toISOString().split('T')[0],
        paddyKg: 0,
        paddyBosta: 0,
        riceOutputs: [{
          id: Date.now().toString(),
          riceTypeId: '',
          riceKg: 0,
          riceBosta: 0,
          riceBostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
        }],
        branOutputs: [{
          id: Date.now().toString(),
          branTypeId: '',
          branBosta: 0,
          branBostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
        }],
        batchNumber: '',
        notes: '',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: err.message || 'উৎপাদন সংরক্ষণ করতে ব্যর্থ হয়েছে',
      });
    }
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
          <Button onClick={fetchData} className="mt-4">
            আবার চেষ্টা করুন
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">উৎপাদন</h1>
          <p className="text-gray-600 mt-1">ধান থেকে চাল ও ভুসি রূপান্তর</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            রিফ্রেশ
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={20} />
            নতুন উৎপাদন
          </Button>
        </div>
      </div>

      {/* Type-wise Stock Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ধানের স্টক (ধরন অনুযায়ী)</h2>
          <div className="space-y-2">
            {currentStock?.paddy && Object.entries(currentStock.paddy).length > 0 ? (
              Object.entries(currentStock.paddy).map(([type, stock]: [string, any]) => {
                const totalWeight = stock.kg || 0;
                const totalBosta = stock.totalBosta || 0;
                if (totalWeight === 0 && totalBosta === 0) return null;
                return (
                  <div key={type} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-amber-900">{type}</p>
                    <p className="text-sm text-amber-700">
                      {totalBosta} বস্তা + {totalWeight.toFixed(2)} কেজি
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">কোন ধানের স্টক নেই</p>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">চালের স্টক (ধরন অনুযায়ী)</h2>
          <div className="space-y-2">
            {currentStock?.rice && Object.entries(currentStock.rice).length > 0 ? (
              Object.entries(currentStock.rice).map(([type, stock]: [string, any]) => {
                const totalWeight = stock.kg || 0;
                const totalBosta = stock.totalBosta || 0;
                if (totalWeight === 0 && totalBosta === 0) return null;
                return (
                  <div key={type} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-900">{type}</p>
                    <p className="text-sm text-green-700">
                      {totalBosta} বস্তা + {totalWeight.toFixed(2)} কেজি
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">কোন চালের স্টক নেই</p>
            )}
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
                  <Label htmlFor="paddyType">ধানের ধরন *</Label>
                  {paddyTypes && paddyTypes.length > 0 ? (
                    <Select
                      value={formData.paddyTypeId}
                      onValueChange={(value) => setFormData({ ...formData, paddyTypeId: value })}
                      required
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
                <div>
                  <Label htmlFor="productionDate">উৎপাদনের তারিখ *</Label>
                  <Input
                    id="productionDate"
                    type="date"
                    required
                    value={formData.productionDate}
                    onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="batchNumber">ব্যাচ নম্বর</Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    placeholder="স্বয়ংক্রিয়ভাবে তৈরি হবে"
                  />
                </div>
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
                  showBostaSize={false}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">আউটপুট চাল</h3>
                  {riceTypes && riceTypes.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newRiceOutput = {
                          id: Date.now().toString(),
                          riceTypeId: '',
                          riceKg: 0,
                          riceBosta: 0,
                          riceBostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
                        };
                        setFormData({
                          ...formData,
                          riceOutputs: [...formData.riceOutputs, newRiceOutput],
                        });
                      }}
                    >
                      <Plus size={16} className="mr-1" />
                      চাল যোগ করুন
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  {formData.riceOutputs.map((riceOutput, index) => (
                    <div key={riceOutput.id} className="space-y-4">
                      {formData.riceOutputs.length > 1 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">চাল #{index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                riceOutputs: formData.riceOutputs.filter((_, i) => i !== index),
                              });
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                      <div>
                        <Label htmlFor={`riceType-${riceOutput.id}`}>চালের ধরন</Label>
                        {riceTypes && riceTypes.length > 0 ? (
                          <Select
                            value={riceOutput.riceTypeId}
                            onValueChange={(value) => {
                              const updatedOutputs = [...formData.riceOutputs];
                              updatedOutputs[index].riceTypeId = value;
                              setFormData({ ...formData, riceOutputs: updatedOutputs });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="চালের ধরন নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                              {riceTypes.map((type: any) => (
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
                              placeholder="কোনো চালের ধরন নেই"
                              className="bg-gray-50"
                            />
                            <p className="text-sm text-gray-500">প্রথমে চালের ধরন যোগ করুন</p>
                          </div>
                        )}
                      </div>
                      {riceOutput.riceTypeId && (
                        <QuantityInput
                          kg={riceOutput.riceKg}
                          bosta={riceOutput.riceBosta}
                          bostaSize={riceOutput.riceBostaSize}
                          onKgChange={(kg) => {
                            const updatedOutputs = [...formData.riceOutputs];
                            updatedOutputs[index].riceKg = kg;
                            setFormData({ ...formData, riceOutputs: updatedOutputs });
                          }}
                          onBostaChange={(bosta) => {
                            const updatedOutputs = [...formData.riceOutputs];
                            updatedOutputs[index].riceBosta = bosta;
                            setFormData({ ...formData, riceOutputs: updatedOutputs });
                          }}
                          onBostaSizeChange={(size) => {
                            const updatedOutputs = [...formData.riceOutputs];
                            updatedOutputs[index].riceBostaSize = size;
                            setFormData({ ...formData, riceOutputs: updatedOutputs });
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">আউটপুট ভুসি</h3>
                  {branTypes && branTypes.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newBranOutput = {
                          id: Date.now().toString(),
                          branTypeId: '',
                          branBosta: 0,
                          branBostaSize: DEFAULT_BOSTA_SIZE as BostaSize,
                        };
                        setFormData({
                          ...formData,
                          branOutputs: [...formData.branOutputs, newBranOutput],
                        });
                      }}
                    >
                      <Plus size={16} className="mr-1" />
                      ভুসি যোগ করুন
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  {formData.branOutputs.map((branOutput, index) => (
                    <div key={branOutput.id} className="space-y-4">
                      {formData.branOutputs.length > 1 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">ভুসি #{index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                branOutputs: formData.branOutputs.filter((_, i) => i !== index),
                              });
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                      <div>
                        <Label htmlFor={`branType-${branOutput.id}`}>ভুসির ধরন</Label>
                        {branTypes && branTypes.length > 0 ? (
                          <Select
                            value={branOutput.branTypeId}
                            onValueChange={(value) => {
                              const updatedOutputs = [...formData.branOutputs];
                              updatedOutputs[index].branTypeId = value;
                              setFormData({ ...formData, branOutputs: updatedOutputs });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="ভুসির ধরন নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                              {branTypes.map((type: any) => (
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
                              placeholder="কোনো ভুসির ধরন নেই"
                              className="bg-gray-50"
                            />
                            <p className="text-sm text-gray-500">প্রথমে ভুসির ধরন যোগ করুন</p>
                          </div>
                        )}
                      </div>
                      {branOutput.branTypeId && (
                        <QuantityInput
                          kg={0}
                          bosta={branOutput.branBosta}
                          bostaSize={branOutput.branBostaSize}
                          onKgChange={() => {}}
                          onBostaChange={(bosta) => {
                            const updatedOutputs = [...formData.branOutputs];
                            updatedOutputs[index].branBosta = bosta;
                            setFormData({ ...formData, branOutputs: updatedOutputs });
                          }}
                          onBostaSizeChange={(size) => {
                            const updatedOutputs = [...formData.branOutputs];
                            updatedOutputs[index].branBostaSize = size;
                            setFormData({ ...formData, branOutputs: updatedOutputs });
                          }}
                          showKg={false}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">নোট</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="অতিরিক্ত তথ্য (ঐচ্ছিক)"
                />
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
              <TableHead>ব্যাচ নম্বর</TableHead>
              <TableHead>ধানের ধরন</TableHead>
              <TableHead>ইনপুট ধান</TableHead>
              <TableHead>চাল আউটপুট</TableHead>
              <TableHead>ভুসি আউটপুট</TableHead>
              <TableHead>চাল ফলন %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches && batches.length > 0 ? (
              batches.map((batch) => {
                const paddyTotalKg = parseFloat(batch.paddyQuantity) || 0;
                const riceOutputs = batch.outputs?.filter((o: any) => o.outputType === 'RICE') || [];
                const branOutputs = batch.outputs?.filter((o: any) => o.outputType === 'BRAN') || [];
                
                let riceTotalKg = 0;
                riceOutputs.forEach((output: any) => {
                  riceTotalKg += calculateTotalKg(0, output.bostaQuantity || 0, output.bostaSize || 50);
                });

                let branTotalKg = 0;
                branOutputs.forEach((output: any) => {
                  branTotalKg += calculateTotalKg(0, output.bostaQuantity || 0, output.bostaSize || 50);
                });

                const riceYield = paddyTotalKg > 0 ? ((riceTotalKg / paddyTotalKg) * 100).toFixed(2) : '0.00';

                return (
                  <TableRow key={batch.id}>
                    <TableCell>{new Date(batch.productionDate).toLocaleDateString('bn-BD')}</TableCell>
                    <TableCell className="font-medium">{batch.batchNumber || `BATCH-${batch.id}`}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {batch.paddyType?.name || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {paddyTotalKg.toFixed(2)} কেজি
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {riceOutputs.map((output: any, idx: number) => (
                        <div key={idx} className="text-xs">
                          {output.bostaQuantity || 0} বস্তা ({output.bostaSize || 50}কেজি)
                          {output.riceTypeId && ` - Type ID: ${output.riceTypeId}`}
                        </div>
                      ))}
                      {riceTotalKg > 0 && (
                        <span className="text-muted-foreground ml-1">({riceTotalKg.toFixed(2)} কেজি)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-yellow-600 font-medium">
                      {branOutputs.map((output: any, idx: number) => (
                        <div key={idx} className="text-xs">
                          {output.bostaQuantity || 0} বস্তা ({output.bostaSize || 50}কেজি)
                          {output.branTypeId && ` - Type ID: ${output.branTypeId}`}
                        </div>
                      ))}
                      {branTotalKg > 0 && (
                        <span className="text-muted-foreground ml-1">({branTotalKg.toFixed(2)} কেজি)</span>
                      )}
                    </TableCell>
                    <TableCell>{riceYield}%</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  কোনো উৎপাদন রেকর্ড নেই
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
