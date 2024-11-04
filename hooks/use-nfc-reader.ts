import { NFCReader } from '@/services/NFCReader';
import { CardState, Transaction } from '@/types';
import { useState, useCallback, useRef } from 'react';

interface NFCReaderResult {
    cardState: CardState;
    transactions: Transaction[];
    isReading: boolean;
    startReading: () => Promise<void>;
    stopReading: () => void;
}

export function useNfcReader(): NFCReaderResult {
    const [cardState, setCardState] = useState<CardState>({ type: 'WaitingForTap' });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isReading, setIsReading] = useState(false);
    const readerRef = useRef<NFCReader | null>(null);

    const startReading = useCallback(async () => {
        if (isReading) return;

        try {
            setIsReading(true);
            setCardState({ type: 'Reading' });

            // Initialize reader if needed
            if (!readerRef.current) {
                readerRef.current = new NFCReader();
                await readerRef.current.initialize();
            }

            const result = await readerRef.current.read();

            if (!result.success || !result.data) {
                throw new Error(result.error || 'Failed to read card');
            }

            // Parse and update transactions
            if (result.transactions) {
                setTransactions(result.transactions);
                if (result.transactions.length > 0) {
                    setCardState({ 
                        type: 'Balance', 
                        amount: result.transactions[0].balance 
                    });
                }
            }

        } catch (error) {
            console.error('Error reading card:', error);
            setCardState({ 
                type: 'Error',
                message: error instanceof Error ? error.message : 'Failed to read card'
            });
            setTransactions([]);
        } finally {
            setIsReading(false);
        }
    }, [isReading]);

    const stopReading = useCallback(() => {
        if (readerRef.current) {
            readerRef.current.cleanup();
            readerRef.current = null;
        }
        setIsReading(false);
        setCardState({ type: 'WaitingForTap' });
    }, []);

    return {
        cardState,
        transactions,
        isReading,
        startReading,
        stopReading
    };
}