'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { farmersAPI, customersAPI, salesAPI, paddyAPI, paymentsAPI } from '@/lib/api';
import { CreditCard, Loader2, Users, DollarSign, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast-simple';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type PaymentType = 'farmer' | 'customer' | 'paddy-purchase' | 'sale';

export default function PaymentsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PaymentType>('farmer');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [farmers, setFarmers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [paddyPurchases, setPaddyPurchases] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [farmersData, customersData, purchasesData, salesData] = await Promise.all([
        farmersAPI.getAll(),
        customersAPI.getAll(),
        paddyAPI.getAllPaddyPurchases(),
        salesAPI.getAll(),
      ]);
      setFarmers(farmersData || []);
      setCustomers(customersData || []);
      setPaddyPurchases(purchasesData || []);
      setSales(salesData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = (item: any, type: PaymentType) => {
    setSelectedItem({ ...item, paymentType: type });
    setPaymentAmount('');
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: 'সঠিক পরিমাণ লিখুন',
      });
      return;
    }

    try {
      setError(null);
      switch (selectedItem.paymentType) {
        case 'farmer':
          await paymentsAPI.payFarmerDue(selectedItem.id, amount);
          break;
        case 'customer':
          await paymentsAPI.payCustomerDue(selectedItem.id, amount);
          break;
        case 'paddy-purchase':
          await paymentsAPI.payPaddyPurchase(selectedItem.id, amount);
          break;
        case 'sale':
          await paymentsAPI.paySale(selectedItem.id, amount);
          break;
      }

      toast({
        variant: 'success',
        title: 'সফল',
        description: 'পেমেন্ট সফলভাবে সম্পন্ন হয়েছে',
      });

      setIsPaymentDialogOpen(false);
      setSelectedItem(null);
      setPaymentAmount('');
      fetchData();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to process payment';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: errorMessage,
      });
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

  const getPendingItems = () => {
    switch (activeTab) {
      case 'farmer':
        return farmers.filter(f => f.totalDue && f.totalDue > 0);
      case 'customer':
        return customers.filter(c => c.totalDue && c.totalDue > 0);
      case 'paddy-purchase':
        return paddyPurchases.filter(p => p.dueAmount && p.dueAmount > 0);
      case 'sale':
        return sales.filter(s => s.dueAmount && s.dueAmount > 0);
      default:
        return [];
    }
  };

  const pendingItems = getPendingItems();

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">পেমেন্ট ব্যবস্থাপনা</h1>
        </div>
        <p className="text-gray-600 mt-2">কৃষক, গ্রাহক, কেনা এবং বিক্রয়ের পেমেন্ট করুন</p>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {[
          { key: 'farmer', label: 'কৃষক', icon: Users },
          { key: 'customer', label: 'গ্রাহক', icon: Users },
          { key: 'paddy-purchase', label: 'ধান কেনা', icon: DollarSign },
          { key: 'sale', label: 'বিক্রয়', icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as PaymentType)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Payment Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {activeTab === 'farmer' && (
                  <>
                    <TableHead className="font-semibold">কৃষকের নাম</TableHead>
                    <TableHead className="font-semibold">মোবাইল</TableHead>
                    <TableHead className="font-semibold">মোট কেনা</TableHead>
                    <TableHead className="font-semibold">বাকি টাকা</TableHead>
                    <TableHead className="font-semibold text-right">কার্যক্রম</TableHead>
                  </>
                )}
                {activeTab === 'customer' && (
                  <>
                    <TableHead className="font-semibold">গ্রাহকের নাম</TableHead>
                    <TableHead className="font-semibold">মোবাইল</TableHead>
                    <TableHead className="font-semibold">মোট বিক্রয়</TableHead>
                    <TableHead className="font-semibold">বাকি টাকা</TableHead>
                    <TableHead className="font-semibold text-right">কার্যক্রম</TableHead>
                  </>
                )}
                {activeTab === 'paddy-purchase' && (
                  <>
                    <TableHead className="font-semibold">তারিখ</TableHead>
                    <TableHead className="font-semibold">কৃষক</TableHead>
                    <TableHead className="font-semibold">মোট পরিমাণ</TableHead>
                    <TableHead className="font-semibold">বাকি টাকা</TableHead>
                    <TableHead className="font-semibold text-right">কার্যক্রম</TableHead>
                  </>
                )}
                {activeTab === 'sale' && (
                  <>
                    <TableHead className="font-semibold">ইনভয়েস</TableHead>
                    <TableHead className="font-semibold">গ্রাহক</TableHead>
                    <TableHead className="font-semibold">মোট পরিমাণ</TableHead>
                    <TableHead className="font-semibold">বাকি টাকা</TableHead>
                    <TableHead className="font-semibold text-right">কার্যক্রম</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">কোনো বাকি নেই</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pendingItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                    {activeTab === 'farmer' && (
                      <>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.phone || '-'}</TableCell>
                        <TableCell>৳{item.totalPurchased?.toLocaleString() || 0}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-red-600">
                            ৳{item.totalDue?.toLocaleString() || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handlePaymentClick(item, 'farmer')}
                            className="hover:bg-green-600"
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            পেমেন্ট
                          </Button>
                        </TableCell>
                      </>
                    )}
                    {activeTab === 'customer' && (
                      <>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.phone || '-'}</TableCell>
                        <TableCell>৳{item.totalSales?.toLocaleString() || 0}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-red-600">
                            ৳{item.totalDue?.toLocaleString() || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handlePaymentClick(item, 'customer')}
                            className="hover:bg-green-600"
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            পেমেন্ট
                          </Button>
                        </TableCell>
                      </>
                    )}
                    {activeTab === 'paddy-purchase' && (
                      <>
                        <TableCell>{new Date(item.purchaseDate).toLocaleDateString('bn-BD')}</TableCell>
                        <TableCell className="font-medium">{item.farmer?.name || '-'}</TableCell>
                        <TableCell>৳{item.totalAmount?.toLocaleString() || 0}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-red-600">
                            ৳{item.dueAmount?.toLocaleString() || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handlePaymentClick(item, 'paddy-purchase')}
                            className="hover:bg-green-600"
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            পেমেন্ট
                          </Button>
                        </TableCell>
                      </>
                    )}
                    {activeTab === 'sale' && (
                      <>
                        <TableCell className="font-medium">{item.invoiceNumber || `#${item.id}`}</TableCell>
                        <TableCell>{item.customer?.name || '-'}</TableCell>
                        <TableCell>৳{item.totalAmount?.toLocaleString() || 0}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-red-600">
                            ৳{item.dueAmount?.toLocaleString() || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handlePaymentClick(item, 'sale')}
                            className="hover:bg-green-600"
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            পেমেন্ট
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>পেমেন্ট করুন</DialogTitle>
            <DialogDescription>
              {selectedItem && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {selectedItem.paymentType === 'farmer' && `কৃষক: ${selectedItem.name}`}
                    {selectedItem.paymentType === 'customer' && `গ্রাহক: ${selectedItem.name}`}
                    {selectedItem.paymentType === 'paddy-purchase' && `ধান কেনা: ${selectedItem.farmer?.name || 'N/A'}`}
                    {selectedItem.paymentType === 'sale' && `বিক্রয়: ${selectedItem.invoiceNumber || `#${selectedItem.id}`}`}
                  </p>
                  <p className="text-sm font-semibold text-red-600 mt-1">
                    বাকি: ৳{(
                      selectedItem.totalDue || 
                      selectedItem.dueAmount || 
                      0
                    ).toLocaleString()}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="amount">পেমেন্ট পরিমাণ (৳) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedItem?.totalDue || selectedItem?.dueAmount || 0}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  className="mt-1"
                />
                {selectedItem && (
                  <p className="text-xs text-gray-500 mt-1">
                    সর্বোচ্চ: ৳{(selectedItem.totalDue || selectedItem.dueAmount || 0).toLocaleString()}
                  </p>
                )}
              </div>
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPaymentDialogOpen(false);
                  setSelectedItem(null);
                  setPaymentAmount('');
                }}
              >
                বাতিল
              </Button>
              <Button type="submit">পেমেন্ট করুন</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

