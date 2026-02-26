export interface StockSummary {
  paddy: {
    [key: string]: {
      totalKg: number;
      totalBosta: number;
    };
  };
  rice: {
    [key: string]: {
      totalKg: number;
      totalBosta: number;
    };
  };
  bran: {
    [key: string]: {
      totalKg: number;
      totalBosta: number;
    };
  };
}