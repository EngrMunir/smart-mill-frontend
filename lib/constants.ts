import { PaddyType, RiceType, BranType } from './types';

export type { PaddyType, RiceType, BranType };

export const PADDY_TYPES: PaddyType[] = ['২৮', 'চিকন', 'পাঞ্জাব', 'সাদা পাঞ্জাব', 'সিলেটি', '৪৯', 'অন্যান্য'];

export const RICE_TYPES: RiceType[] = ['মিনিকেট', 'নাজিরশাইল', 'কাটারি', 'বাসমতি', 'আতপ', 'সিদ্ধ', 'পোলাও চাল', 'অন্যান্য'];

export const BRAN_TYPES: BranType[] = ['মোটা ভুসি', 'চিকন ভুসি'];

export const DEFAULT_BOSTA_SIZE: 25 | 50 = 50;

// Mill Information (Global - Must use everywhere)
export const MILL_INFO = {
  name: 'আল হুদা অটো রাইস মিল',
  address: 'পোমরা শান্তিরহাট, রাঙ্গুনিয়া, চট্টগ্রাম',
  mobile: '০১৮২৬৫৮২৪২৩',
};

