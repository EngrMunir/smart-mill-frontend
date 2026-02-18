'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BostaSize, calculateTotalKg, bostaToKg, kgToBosta } from '@/lib/stockUtils';

interface QuantityInputProps {
  label?: string;
  kg: number;
  bosta: number;
  bostaSize: BostaSize;
  onKgChange: (kg: number) => void;
  onBostaChange: (bosta: number) => void;
  onBostaSizeChange: (size: BostaSize) => void;
  className?: string;
  showBostaSize?: boolean;
  showKg?: boolean;
}

export function QuantityInput({
  label = 'পরিমাণ',
  kg,
  bosta,
  bostaSize,
  onKgChange,
  onBostaChange,
  onBostaSizeChange,
  className,
  showBostaSize = true,
  showKg = true,
}: QuantityInputProps) {
  const [kgInput, setKgInput] = useState(kg.toString());
  const [bostaInput, setBostaInput] = useState(bosta.toString());

  useEffect(() => {
    setKgInput(kg.toString());
  }, [kg]);

  useEffect(() => {
    setBostaInput(bosta.toString());
  }, [bosta]);

  const handleKgChange = (value: string) => {
    setKgInput(value);
    const numValue = parseFloat(value) || 0;
    onKgChange(numValue);
    // Auto-calculate bosta from remaining kg
    const totalKg = calculateTotalKg(numValue, bosta, bostaSize);
    const newBosta = Math.floor(totalKg / bostaSize);
    const remainingKg = totalKg % bostaSize;
    if (newBosta !== bosta) {
      onBostaChange(newBosta);
      onKgChange(remainingKg);
    }
  };

  const handleBostaChange = (value: string) => {
    setBostaInput(value);
    const numValue = parseFloat(value) || 0;
    onBostaChange(numValue);
  };

  const totalKg = calculateTotalKg(kg, bosta, bostaSize);

  return (
    <div className={className}>
      {label && <Label className="mb-2 block">{label}</Label>}
      {showKg ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kg" className="text-xs text-muted-foreground">কেজি</Label>
              <Input
                id="kg"
                type="number"
                step="0.01"
                value={kgInput}
                onChange={(e) => handleKgChange(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="bosta" className="text-xs text-muted-foreground">বস্তা</Label>
              <Input
                id="bosta"
                type="number"
                step="0.01"
                value={bostaInput}
                onChange={(e) => handleBostaChange(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {showBostaSize && (
              <>
                <Label htmlFor="bosta-size" className="text-xs text-muted-foreground">বস্তার সাইজ:</Label>
                <Select
                  value={bostaSize.toString()}
                  onValueChange={(value) => onBostaSizeChange(parseInt(value) as BostaSize)}
                >
                  <SelectTrigger id="bosta-size" className="h-8 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">২৫ কেজি</SelectItem>
                    <SelectItem value="50">৫০ কেজি</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            <span className={`text-xs text-muted-foreground ${showBostaSize ? 'ml-auto' : ''}`}>
              মোট: {totalKg.toFixed(2)} কেজি
            </span>
          </div>
        </>
      ) : (
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="bosta" className="text-xs text-muted-foreground">বস্তা</Label>
            <Input
              id="bosta"
              type="number"
              step="0.01"
              value={bostaInput}
              onChange={(e) => handleBostaChange(e.target.value)}
              placeholder="0"
            />
          </div>
          {showBostaSize && (
            <div className="flex-1">
              <Label htmlFor="bosta-size" className="text-xs text-muted-foreground">বস্তার সাইজ</Label>
              <Select
                value={bostaSize.toString()}
                onValueChange={(value) => onBostaSizeChange(parseInt(value) as BostaSize)}
              >
                <SelectTrigger id="bosta-size" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">২৫ কেজি</SelectItem>
                  <SelectItem value="50">৫০ কেজি</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <span className="text-xs text-muted-foreground mb-2">
            মোট: {totalKg.toFixed(2)} কেজি
          </span>
        </div>
      )}
    </div>
  );
}





