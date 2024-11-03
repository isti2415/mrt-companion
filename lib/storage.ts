import { CachedData, Transaction } from '@/types';

const STORAGE_KEY = 'dhaka-mrt-companion-data';

export const saveToCache = async (transactions: Transaction[], balance: number) => {
  const data: CachedData = {
    lastReadTime: new Date().toISOString(),
    transactions,
    lastBalance: balance
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to cache:', error);
  }
};

export const getFromCache = (): CachedData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to read from cache:', error);
    return null;
  }
};