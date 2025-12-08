
export interface UserData {
  name: string;
  dob: string; // YYYY-MM-DD
  gender: 'male' | 'female';
}

export interface MonthlyFortune {
  month: number;
  title: string;
  solarDateRange: string; // e.g. "Feb 17 - Mar 18"
  content: string;
  score: number; // 1-5 stars
}

export interface LuckyProduct {
  name: string;
  type: 'Crystal' | 'Amber' | 'Gold' | 'Other';
  description: string;
  reason: string;
}

export interface FortuneResult {
  overview: string;
  monthly: MonthlyFortune[];
  products: LuckyProduct[];
}

export type AppStep = 'selection' | 'input' | 'analyzing' | 'result';
