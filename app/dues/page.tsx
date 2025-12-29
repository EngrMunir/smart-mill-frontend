'use client';

import MainLayout from '@/components/MainLayout';
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
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Due Management</h1>
          <p className="text-gray-600 mt-1">Manage farmer and customer dues</p>
        </div>

        {/* Farmer Dues */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Farmer Dues</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farmer Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Due</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmers.filter(f => f.totalDue > 0).length > 0 ? (
                farmers.filter(f => f.totalDue > 0).map((farmer) => (
                  <TableRow key={farmer.id}>
                    <TableCell className="font-medium">{farmer.name}</TableCell>
                    <TableCell>{farmer.phone}</TableCell>
                    <TableCell className="text-red-600 font-semibold">₹{farmer.totalDue.toLocaleString()}</TableCell>
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
                        Pay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No farmer dues
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Customer Dues */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Customer Dues</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Total Due</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerDues.length > 0 ? (
                customerDues.map((due) => (
                  <TableRow key={due.id}>
                    <TableCell className="font-medium">{due.customerName}</TableCell>
                    <TableCell className="text-red-600 font-semibold">₹{due.totalDue.toLocaleString()}</TableCell>
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
                        Pay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No customer dues
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
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record payment for {paymentType === 'farmer' ? 'farmer' : 'customer'} due
              </DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <form onSubmit={handlePaymentSubmit}>
                <div className="space-y-4 py-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {paymentType === 'farmer' ? 'Farmer' : 'Customer'}: <span className="font-semibold">{selectedItem.name || selectedItem.customerName}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Total Due: <span className="font-semibold text-red-600">₹{selectedItem.totalDue.toLocaleString()}</span>
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="amount">Payment Amount (₹)</Label>
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
                    <Label htmlFor="date">Payment Date</Label>
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
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Record Payment
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
