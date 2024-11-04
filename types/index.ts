export type StationType = 
    | 'Motijheel'
    | 'Bangladesh Secretariat'
    | 'Dhaka University'
    | 'Shahbagh'
    | 'Karwan Bazar'
    | 'Farmgate'
    | 'Bijoy Sarani'
    | 'Agargaon'
    | 'Shewrapara'
    | 'Kazipara'
    | 'Mirpur 10'
    | 'Mirpur 11'
    | 'Pallabi'
    | 'Uttara South'
    | 'Uttara Center'
    | 'Uttara North';

export interface Transaction {
    fixedHeader: string;
    timestamp: string;
    transactionType: string;
    fromStation: StationType | string;
    toStation: StationType | string;
    balance: number;
    trailing: string;
}

export interface TransactionWithAmount {
    transaction: Transaction;
    amount: number | null;
}

export type CardState = 
    | { type: 'WaitingForTap' }
    | { type: 'Reading' }
    | { type: 'Balance'; amount: number }
    | { type: 'Error'; message: string }
    | { type: 'NoNfcSupport' }
    | { type: 'NfcDisabled' };