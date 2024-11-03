export interface Transaction {
    id: string;
    fixedHeader: string;
    timestamp: string;
    transactionType: TransactionType;
    fromStation: {
        en: string;
        bn: string;
    };
    toStation: {
        en: string;
        bn: string;
    };
    amount: number;
    balance: number;
    trailing: string;
}

export type TransactionType =
    | 'FARE'
    | 'RECHARGE';

export interface CachedData {
    lastReadTime: string;
    transactions: Transaction[];
    lastBalance: number;
    cardNumber?: string;
}

export type CardState =
    | { type: 'balance'; amount: number; lastRead: string; cardNumber?: string }
    | { type: 'waitingForTap' }
    | { type: 'reading' }
    | { type: 'error'; message: string };