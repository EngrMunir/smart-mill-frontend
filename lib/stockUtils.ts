export type BostaSize = 25 | 50;

export interface StockQuantity {
  kg: number;
  bosta: number;
  bostaSize: BostaSize;
}

/**
 * Convert KG to Bosta based on bosta size
 */
export function kgToBosta(kg: number, bostaSize: BostaSize): number {
  return kg / bostaSize;
}

/**
 * Convert Bosta to KG based on bosta size
 */
export function bostaToKg(bosta: number, bostaSize: BostaSize): number {
  return bosta * bostaSize;
}

/**
 * Calculate total KG from KG and Bosta
 */
export function calculateTotalKg(kg: number, bosta: number, bostaSize: BostaSize): number {
  return kg + bostaToKg(bosta, bostaSize);
}

/**
 * Normalize stock to show both KG and Bosta
 */
export function normalizeStock(totalKg: number, bostaSize: BostaSize): StockQuantity {
  const bosta = Math.floor(totalKg / bostaSize);
  const remainingKg = totalKg % bostaSize;
  return {
    kg: Math.round(remainingKg * 100) / 100,
    bosta,
    bostaSize,
  };
}

/**
 * Format stock display
 */
export function formatStock(stock: StockQuantity): string {
  const parts: string[] = [];
  if (stock.kg > 0) parts.push(`${stock.kg} KG`);
  if (stock.bosta > 0) parts.push(`${stock.bosta} Bosta (${stock.bostaSize}kg)`);
  return parts.length > 0 ? parts.join(' + ') : '0 KG';
}



