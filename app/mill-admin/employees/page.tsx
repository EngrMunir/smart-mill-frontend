'use client';

import { employees, salaryPayments } from '@/lib/sampleData';
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
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { useState } from 'react';

export default function EmployeesPage() {
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    position: '',
    salary: '',
  });
  const [salaryForm, setSalaryForm] = useState({
    month: '',
    year: new Date().getFullYear().toString(),
    amount: '',
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Employee data:', formData);
    setShowEmployeeModal(false);
    setFormData({ name: '', phone: '', position: '', salary: '' });
    setEditingEmployee(null);
  };

  const handleSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Salary payment:', {
      employee: selectedEmployee,
      ...salaryForm,
    });
    setShowSalaryModal(false);
    setSalaryForm({ month: '', year: new Date().getFullYear().toString(), amount: '' });
    setSelectedEmployee(null);
  };

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">কর্মচারী</h1>
            <p className="text-gray-600 mt-1">কর্মচারী ও বেতন ব্যবস্থাপনা</p>
          </div>
          <Button
            onClick={() => {
              setEditingEmployee(null);
              setFormData({ name: '', phone: '', position: '', salary: '' });
              setShowEmployeeModal(true);
            }}
          >
            <Plus size={20} />
            কর্মচারী যোগ করুন
          </Button>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">কর্মচারী তালিকা</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>নাম</TableHead>
                <TableHead>ফোন</TableHead>
                <TableHead>পদ</TableHead>
                <TableHead>বেতন</TableHead>
                <TableHead>শেষ পরিশোধ</TableHead>
                <TableHead className="text-right">কর্ম</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell className="font-medium">৳{employee.salary.toLocaleString()}</TableCell>
                  <TableCell>{employee.lastPaidDate || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setSalaryForm({
                            month: '',
                            year: new Date().getFullYear().toString(),
                            amount: employee.salary.toString(),
                          });
                          setShowSalaryModal(true);
                        }}
                      >
                        <DollarSign size={16} className="mr-1" />
                        বেতন
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingEmployee(employee);
                          setFormData({
                            name: employee.name,
                            phone: employee.phone,
                            position: employee.position,
                            salary: employee.salary.toString(),
                          });
                          setShowEmployeeModal(true);
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

        {/* Salary Payment History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">বেতন পরিশোধের ইতিহাস</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>তারিখ</TableHead>
                <TableHead>কর্মচারী</TableHead>
                <TableHead>মাস</TableHead>
                <TableHead>বছর</TableHead>
                <TableHead>পরিমাণ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell className="font-medium">{payment.employeeName}</TableCell>
                  <TableCell>{payment.month}</TableCell>
                  <TableCell>{payment.year}</TableCell>
                  <TableCell className="font-medium">৳{payment.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Employee Dialog */}
        <Dialog open={showEmployeeModal} onOpenChange={setShowEmployeeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEmployee ? 'কর্মচারী সম্পাদনা' : 'নতুন কর্মচারী যোগ করুন'}</DialogTitle>
              <DialogDescription>
                {editingEmployee ? 'কর্মচারীর তথ্য আপডেট করুন' : 'সিস্টেমে নতুন কর্মচারী যোগ করুন'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEmployeeSubmit}>
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
                  <Label htmlFor="position">পদ</Label>
                  <Input
                    id="position"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="salary">মাসিক বেতন (৳)</Label>
                  <Input
                    id="salary"
                    type="number"
                    required
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEmployeeModal(false)}>
                  বাতিল
                </Button>
                <Button type="submit">{editingEmployee ? 'আপডেট' : 'যোগ করুন'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Salary Payment Dialog */}
        <Dialog open={showSalaryModal} onOpenChange={setShowSalaryModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>বেতন পরিশোধ করুন</DialogTitle>
              <DialogDescription>
                কর্মচারীর বেতন পরিশোধ রেকর্ড করুন
              </DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <form onSubmit={handleSalarySubmit}>
                <div className="space-y-4 py-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      কর্মচারী: <span className="font-semibold">{selectedEmployee.name}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      পদ: <span className="font-semibold">{selectedEmployee.position}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      মাসিক বেতন: <span className="font-semibold">৳{selectedEmployee.salary.toLocaleString()}</span>
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="month">মাস</Label>
                    <Select
                      value={salaryForm.month}
                      onValueChange={(value) => setSalaryForm({ ...salaryForm, month: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="মাস নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="year">বছর</Label>
                    <Input
                      id="year"
                      type="number"
                      required
                      value={salaryForm.year}
                      onChange={(e) => setSalaryForm({ ...salaryForm, year: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">পরিমাণ (৳)</Label>
                    <Input
                      id="amount"
                      type="number"
                      required
                      step="0.01"
                      value={salaryForm.amount}
                      onChange={(e) => setSalaryForm({ ...salaryForm, amount: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowSalaryModal(false)}>
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






































