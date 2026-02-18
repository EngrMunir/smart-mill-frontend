'use client';

import { farmers, customerDues } from '@/lib/sampleData';
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
import { DollarSign } from 'lucide-react';
import { useState } from 'react';

export default function DuesPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'farmer' | 'customer'>('farmer');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Payment data:', {
      type: paymentType,
      item: selectedItem,
      amount: paymentData.amount,
      date: paymentData.date,
    });
    setShowPaymentModal(false);
    setPaymentData({ amount: '', date: new Date().toISOString().split('T')[0] });
    setSelectedItem(null);
  };

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">বাকি হিসাব</h1>
          <p className="text-gray-600 mt-1">কৃষক ও গ্রাহকের বাকি ব্যবস্থাপনা</p>
        </div>

        {/* Farmer Dues */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">কৃষকের বাকি</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>কৃষকের নাম</TableHead>
                <TableHead>ফোন</TableHead>
                <TableHead>মোট বাকি</TableHead>
                <TableHead className="text-right">কর্ম</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmers.filter(f => f.totalDue > 0).length > 0 ? (
                farmers.filter(f => f.totalDue > 0).map((farmer) => (
                  <TableRow key={farmer.id}>
                    <TableCell className="font-medium">{farmer.name}</TableCell>
                    <TableCell>{farmer.phone}</TableCell>
                    <TableCell className="text-red-600 font-semibold">৳{farmer.totalDue.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setPaymentType('farmer');
                          setSelectedItem(farmer);
                          setShowPaymentModal(true);
                        }}
                      >
                        <DollarSign size={16} className="mr-1" />
                        পরিশোধ
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    কোনো কৃষকের বাকি নেই
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Customer Dues */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">গ্রাহকের বাকি</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>গ্রাহকের নাম</TableHead>
                <TableHead>মোট বাকি</TableHead>
                <TableHead>শেষ পরিশোধ</TableHead>
                <TableHead className="text-right">কর্ম</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerDues.length > 0 ? (
                customerDues.map((due) => (
                  <TableRow key={due.id}>
                    <TableCell className="font-medium">{due.customerName}</TableCell>
                    <TableCell className="text-red-600 font-semibold">৳{due.totalDue.toLocaleString()}</TableCell>
                    <TableCell>{due.lastPaymentDate || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setPaymentType('customer');
                          setSelectedItem(due);
                          setShowPaymentModal(true);
                        }}
                      >
                        <DollarSign size={16} className="mr-1" />
                        পরিশোধ
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    কোনো গ্রাহকের বাকি নেই
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Payment Dialog */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>পরিশোধ রেকর্ড করুন</DialogTitle>
              <DialogDescription>
                {paymentType === 'farmer' ? 'কৃষক' : 'গ্রাহক'} এর বাকি পরিশোধ রেকর্ড করুন
              </DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <form onSubmit={handlePaymentSubmit}>
                <div className="space-y-4 py-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {paymentType === 'farmer' ? 'কৃষক' : 'গ্রাহক'}: <span className="font-semibold">{selectedItem.name || selectedItem.customerName}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      মোট বাকি: <span className="font-semibold text-red-600">৳{selectedItem.totalDue.toLocaleString()}</span>
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="amount">পরিশোধের পরিমাণ (৳)</Label>
                    <Input
                      id="amount"
                      type="number"
                      required
                      step="0.01"
                      max={selectedItem.totalDue}
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">পরিশোধের তারিখ</Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      value={paymentData.date}
                      onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowPaymentModal(false)}>
                    বাতিল
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    পরিশোধ রেকর্ড করুন
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
}






































