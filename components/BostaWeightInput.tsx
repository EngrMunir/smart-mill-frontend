'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { PaddyBosta } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BostaWeightInputProps {
  bostas: PaddyBosta[];
  onBostasChange: (bostas: PaddyBosta[]) => void;
}

export function BostaWeightInput({ bostas, onBostasChange }: BostaWeightInputProps) {
  const addBosta = () => {
    const newBostaNo = bostas.length > 0 ? Math.max(...bostas.map(b => b.bostaNo)) + 1 : 1;
    onBostasChange([...bostas, { bostaNo: newBostaNo, weightKg: 0 }]);
  };

  const removeBosta = (index: number) => {
    const newBostas = bostas.filter((_, i) => i !== index);
    // Renumber bostas
    const renumbered = newBostas.map((b, i) => ({ ...b, bostaNo: i + 1 }));
    onBostasChange(renumbered);
  };

  const updateBostaWeight = (index: number, weight: number) => {
    const updated = [...bostas];
    updated[index] = { ...updated[index], weightKg: weight };
    onBostasChange(updated);
  };

  const totalKg = bostas.reduce((sum, b) => sum + b.weightKg, 0);
  const totalBosta = bostas.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>বস্তার ওজন (প্রতিটি আলাদা)</Label>
        <Button type="button" variant="outline" size="sm" onClick={addBosta}>
          <Plus size={16} className="mr-1" />
          বস্তা যোগ করুন
        </Button>
      </div>

      {bostas.length > 0 && (
        <>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">বস্তা নং</TableHead>
                  <TableHead>ওজন (কেজি)</TableHead>
                  <TableHead className="w-20">কর্ম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bostas.map((bosta, index) => (
                  <TableRow key={bosta.bostaNo}>
                    <TableCell className="font-medium">{bosta.bostaNo}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={bosta.weightKg || ''}
                        onChange={(e) => updateBostaWeight(index, parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBosta(index)}
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between">
              <span className="font-medium">মোট বস্তা:</span>
              <span className="font-bold">{totalBosta}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-medium">মোট কেজি:</span>
              <span className="font-bold">{totalKg.toFixed(2)} কেজি</span>
            </div>
          </div>
        </>
      )}

      {bostas.length === 0 && (
        <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
          <p>কোন বস্তা যোগ করা হয়নি। শুরু করতে "বস্তা যোগ করুন" ক্লিক করুন।</p>
        </div>
      )}
    </div>
  );
}



