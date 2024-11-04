import { useState, useEffect, useRef, useCallback } from 'react';
import { CardState, Transaction } from '../types';
import { NFCReader } from '../services/NFCReader';
import { ByteParser } from '../utils/byte-parser';
import { NFCLogger, TransactionParser } from '../services/TransactionParser';
import { StationService } from '../services/StationService';
import { TimestampService } from '../services/TimeStampService';
import { useNfcAvailability } from './use-nfc-availability';

interface UseNfcReaderResult {
    cardState: CardState;
    transactions: Transaction[];
    startReading: () => Promise<void>;
    stopReading: () => void;
    isReading: boolean;
}

export function useNfcReader(): UseNfcReaderResult {
    const [cardState, setCardState] = useState<CardState>({ type: 'WaitingForTap' });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isReading, setIsReading] = useState(false);
    const { isAvailable, error: availabilityError } = useNfcAvailability();
    
    const readerRef = useRef<NFCReader | null>(null);
    const parserRef = useRef<TransactionParser | null>(null);

    // Initialize parsers
    useEffect(() => {
        parserRef.current = new TransactionParser(
            new ByteParser(),
            new TimestampService(),
            new StationService()
        );
    }, []);

    // Initialize reader when NFC is available
    useEffect(() => {
        if (!isAvailable) {
            setCardState({ type: 'NoNfcSupport' });
            return;
        }

        const initializeReader = async () => {
            try {
                readerRef.current = new NFCReader();
                const success = await readerRef.current.initialize();
                
                if (!success) {
                    setCardState({ type: 'NfcDisabled' });
                }
            } catch (error) {
                NFCLogger.error('Failed to initialize NFC reader', error);
                setCardState({ 
                    type: 'Error',
                    message: error instanceof Error ? error.message : 'Failed to initialize NFC'
                });
            }
        };

        initializeReader();

        return () => {
            if (readerRef.current) {
                readerRef.current.cleanup();
                readerRef.current = null;
            }
        };
    }, [isAvailable]);

    const startReading = useCallback(async () => {
        if (!readerRef.current || !parserRef.current || isReading) {
            return;
        }

        setIsReading(true);
        setCardState({ type: 'Reading' });

        try {
            const result = await readerRef.current.read();

            if (!result.success || !result.data) {
                throw new Error(result.error || 'Failed to read card');
            }

            const parsedTransactions = parserRef.current.parseTransactionResponse(result.data);
            setTransactions(parsedTransactions);

            if (parsedTransactions.length > 0) {
                setCardState({ 
                    type: 'Balance', 
                    amount: parsedTransactions[0].balance 
                });
            } else {
                throw new Error('No transactions found');
            }

        } catch (error) {
            NFCLogger.error('Error reading card', error);
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
            setIsReading(false);
            setCardState({ type: 'WaitingForTap' });
        }
    }, []);

    // Handle availability error
    useEffect(() => {
        if (availabilityError) {
            setCardState({
                type: 'Error',
                message: availabilityError
            });
        }
    }, [availabilityError]);

    return {
        cardState,
        transactions,
        startReading,
        stopReading,
        isReading
    };
}