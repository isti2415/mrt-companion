import { MRT_STATIONS } from '@/config/stations';
import { CardState, Transaction, TransactionType } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Constants
const BLOCK_SIZE = 16;
const FELICA_SYSTEM_CODE = 0x0003; // FeliCa system code
const FELICA_SERVICE_CODE = 0x220F; // Service code for MRT

interface RawBlock {
  fixedHeader: Uint8Array;
  timestamp: Uint8Array;
  transactionType: Uint8Array;
  fromStationCode: number;
  toStationCode: number;
  balance: number;
  trailing: Uint8Array;
}

interface RawBlock {
  fixedHeader: Uint8Array;
  timestamp: Uint8Array;
  transactionType: Uint8Array;
  fromStationCode: number;
  toStationCode: number;
  balance: number;
  trailing: Uint8Array;
}

export function useMrt() {
  const [cardState, setCardState] = useState<CardState>({ type: 'waitingForTap' });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [isReading, setIsReading] = useState(false);

  // Check NFC support
  useEffect(() => {
    setIsSupported(typeof NDEFReader !== 'undefined');
  }, []);

  // Helper functions remain the same until readCard
  const getStation = useCallback((code: number): { en: string; bn: string } => {
    const station = MRT_STATIONS.find(s => s.code === code);
    if (station) {
      return {
        en: station.nameEn,
        bn: station.nameBn
      };
    }
    return {
      en: "Ticket Machine",
      bn: "টিকেট মেশিন"
    };
  }, []);

  const bytesToHex = useCallback((bytes: Uint8Array): string => {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
  }, []);

  const decodeTimestamp = useCallback((bytes: Uint8Array): string => {
    const value = (bytes[1] << 8) | bytes[0];
    const baseTime = new Date('2024-01-01').getTime();
    const timestamp = baseTime + (value * 60 * 1000);
    return new Date(timestamp).toISOString();
  }, []);

  const determineTransactionType = useCallback((fixedHeader: string): TransactionType => {
    return fixedHeader.startsWith('08 52 10 00') ? 'FARE' : 'RECHARGE';
  }, []);

  const parseBlock = useCallback((block: Uint8Array): RawBlock | null => {
    if (block.length !== BLOCK_SIZE) {
      throw new Error('Invalid block size');
    }

    return {
      fixedHeader: block.slice(0, 4),
      timestamp: block.slice(4, 6),
      transactionType: block.slice(6, 8),
      fromStationCode: block[8],
      toStationCode: block[10],
      balance: (block[13] << 16) | (block[12] << 8) | block[11],
      trailing: block.slice(14, 16)
    };
  }, []);

  const processBlock = useCallback((
    rawBlock: RawBlock,
    previousBalance?: number
  ): Transaction => {
    const fixedHeaderHex = bytesToHex(rawBlock.fixedHeader);
    const type = determineTransactionType(fixedHeaderHex);
    const amount = previousBalance !== undefined
      ? Math.abs(rawBlock.balance - previousBalance)
      : 0;

    return {
      id: uuidv4(),
      timestamp: decodeTimestamp(rawBlock.timestamp),
      transactionType: type,
      fromStation: getStation(rawBlock.fromStationCode),
      toStation: getStation(rawBlock.toStationCode),
      amount,
      balance: rawBlock.balance,
      fixedHeader: fixedHeaderHex,
      trailing: bytesToHex(rawBlock.trailing)
    };
  }, [bytesToHex, decodeTimestamp, determineTransactionType, getStation]);

  const parseResponse = useCallback((response: Uint8Array): Transaction[] => {
    const transactions: Transaction[] = [];

    if (response.length < 13) {
      throw new Error('Response too short');
    }

    if (response[10] !== 0x00 || response[11] !== 0x00) {
      throw new Error('Card read error');
    }

    const numBlocks = response[12];
    const blockData = response.slice(13);

    if (blockData.length < numBlocks * BLOCK_SIZE) {
      throw new Error('Incomplete block data');
    }

    let previousBalance: number | undefined;

    for (let i = 0; i < numBlocks; i++) {
      const offset = i * BLOCK_SIZE;
      const blockBytes = blockData.slice(offset, offset + BLOCK_SIZE);

      try {
        const rawBlock = parseBlock(blockBytes);
        if (rawBlock) {
          const transaction = processBlock(rawBlock, previousBalance);
          transactions.push(transaction);
          previousBalance = rawBlock.balance;
        }
      } catch (error) {
        console.error('Error parsing block:', error);
      }
    }

    return transactions;
  }, [parseBlock, processBlock]);

  const createPollingCommand = useCallback((): Uint8Array => {
    return new Uint8Array([
      0x00, // Length
      0x00, // Command code for Polling
      (FELICA_SYSTEM_CODE >> 8) & 0xFF,
      FELICA_SYSTEM_CODE & 0xFF,
      0x01, // Request code
      0x0F  // Time slot
    ]);
  }, []);

  const createReadCommand = useCallback((idm: Uint8Array, numberOfBlocks: number): Uint8Array => {
    // Calculate total command length
    const commandLength = 12 + (numberOfBlocks * 2); // 12 bytes header + 2 bytes per block
    const command = new Uint8Array(commandLength);
    
    // Command code
    command[0] = 0x06; // Read Without Encryption
    
    // Copy IDm (8 bytes)
    command.set(idm, 1);
    
    // Number of services
    command[9] = 0x01;
    
    // Service code
    command[10] = FELICA_SERVICE_CODE & 0xFF;
    command[11] = (FELICA_SERVICE_CODE >> 8) & 0xFF;
    
    // Number of blocks
    command[12] = numberOfBlocks;
    
    // Block list
    let offset = 13;
    for (let i = 0; i < numberOfBlocks; i++) {
      command[offset++] = 0x80; // 2-byte block list element
      command[offset++] = i;    // Block number
    }
    
    return command;
  }, []);

  const readCard = useCallback(async () => {
    if (!isSupported) {
      setCardState({
        type: 'error',
        message: 'NFC is not supported in this browser'
      });
      return;
    }

    if (isReading) {
      return;
    }

    try {
      setIsReading(true);
      setCardState({ type: 'reading' });

      const ndef = new NDEFReader();
      
      try {
        await ndef.scan();
        console.log('Scanning for MRT card...');
      } catch (error) {
        if (error instanceof Error) {
          switch (error.name) {
            case 'NotAllowedError':
              setCardState({ 
                type: 'error', 
                message: 'Please allow NFC access to read your card' 
              });
              break;
            case 'NotSupportedError':
              setCardState({ 
                type: 'error', 
                message: 'NFC is not available on your device' 
              });
              break;
            case 'NotReadableError':
              setCardState({ 
                type: 'error', 
                message: 'Please enable NFC on your device' 
              });
              break;
            default:
              setCardState({ 
                type: 'error', 
                message: 'Could not start NFC scanning' 
              });
          }
          setIsReading(false);
          return;
        }
      }

      const handleReading = async (event: NDEFReadingEvent) => {
        try {
          console.log('Card detected:', event.serialNumber);

          // Send polling command
          const pollingCommand = createPollingCommand();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pollingResponse = await (event.message as any).sendFeliCaCommand(pollingCommand);
          const pollingResponseArray = new Uint8Array(pollingResponse);
          console.log('Polling response:', bytesToHex(pollingResponseArray));

          // Extract IDm (8 bytes starting from index 1)
          const idm = pollingResponseArray.slice(1, 9);

          // Read blocks
          const numberOfBlocks = 10;
          const readCommand = createReadCommand(idm, numberOfBlocks);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const readResponse = await (event.message as any).sendFeliCaCommand(readCommand);
          const readResponseArray = new Uint8Array(readResponse);
          console.log('Read response:', bytesToHex(readResponseArray));

          const parsedTransactions = parseResponse(readResponseArray);
          if (parsedTransactions.length > 0) {
            setTransactions(parsedTransactions);
            const latestBalance = parsedTransactions[0].balance;

            setCardState({
              type: 'balance',
              amount: latestBalance,
              lastRead: new Date().toISOString()
            });
          } else {
            throw new Error('No transaction data found');
          }
        } catch (error) {
          console.error('Error processing card data:', error);
          setCardState({
            type: 'error',
            message: error instanceof Error ? error.message : 'Failed to read card data'
          });
        } finally {
          setIsReading(false);
        }
      };

      const handleReadError = (error: Error) => {
        console.error('NFC reading error:', error);
        setCardState({
          type: 'error',
          message: 'Error reading card. Please try again'
        });
        setIsReading(false);
      };

      ndef.addEventListener("reading", handleReading);
      ndef.addEventListener("readingerror", handleReadError);

      return () => {
        ndef.removeEventListener("reading", handleReading);
        ndef.removeEventListener("readingerror", handleReadError);
        setIsReading(false);
      };

    } catch (error) {
      console.error('NFC error:', error);
      setCardState({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to read NFC card'
      });
    } finally {
      setIsReading(false);
    }
  }, [isSupported, isReading, parseResponse, bytesToHex, createPollingCommand, createReadCommand]);

  const clearCache = useCallback(() => {
    localStorage.removeItem('dhaka-mrt-companion-data');
    setTransactions([]);
    setCardState({ type: 'waitingForTap' });
  }, []);

  return {
    cardState,
    transactions,
    readCard,
    clearCache,
    isSupported,
    isReading
  };
}