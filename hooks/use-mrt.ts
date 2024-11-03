import { MRT_STATIONS } from '@/config/stations';
import { CardState, Transaction, TransactionType } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Constants from Android implementation
const BLOCK_SIZE = 16;
const SERVICE_CODE = 0x220F; // Service code used in Android

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

  useEffect(() => {
    setIsSupported(typeof NDEFReader !== 'undefined');
  }, []);

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
    return Array.from(bytes, byte => 
      byte.toString(16).padStart(2, '0').toUpperCase()
    ).join(' ');
  }, []);

  // Following Android's timestamp decoding
  const decodeTimestamp = useCallback((bytes: Uint8Array): string => {
    const value = (bytes[1] << 8) | bytes[0];
    const baseTime = new Date('2024-01-01').getTime();
    const timestamp = baseTime + (value * 60 * 1000);
    return new Date(timestamp).toISOString();
  }, []);

  const determineTransactionType = useCallback((fixedHeader: string): TransactionType => {
    // Using Android's logic for transaction type detection
    return fixedHeader.startsWith('08 52 10 00') ? 'FARE' : 'RECHARGE';
  }, []);

  // Create FeliCa command following Android implementation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createFelicaCommand = useCallback((idm: Uint8Array): Uint8Array => {
    const numberOfBlocksToRead = 10;
    const serviceCodeList = [
      (SERVICE_CODE & 0xFF),
      ((SERVICE_CODE >> 8) & 0xFF)
    ];

    // Build block list elements as in Android
    const blockListElements = new Uint8Array(numberOfBlocksToRead * 2);
    for (let i = 0; i < numberOfBlocksToRead; i++) {
      blockListElements[i * 2] = 0x80; // Two-byte block descriptor
      blockListElements[i * 2 + 1] = i; // Block number
    }

    // Calculate command length
    const commandLength = 14 + blockListElements.length;
    const command = new Uint8Array(commandLength);

    // Build command following Android structure
    let offset = 0;
    command[offset++] = commandLength; // Length
    command[offset++] = 0x06; // Command code
    command.set(idm, offset); // IDm
    offset += 8;
    command[offset++] = 0x01; // Number of services
    command[offset++] = serviceCodeList[0];
    command[offset++] = serviceCodeList[1];
    command[offset++] = numberOfBlocksToRead; // Number of blocks
    command.set(blockListElements, offset);

    return command;
  }, []);

  const parseBlock = useCallback((block: Uint8Array): RawBlock => {
    if (block.length !== BLOCK_SIZE) {
      throw new Error('Invalid block size');
    }

    return {
      fixedHeader: block.slice(0, 4),
      timestamp: block.slice(4, 6),
      transactionType: block.slice(6, 8),
      fromStationCode: block[8],
      toStationCode: block[10],
      // Follow Android's little-endian balance parsing
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

    // Follow Android's response parsing
    if (response.length < 13) {
      throw new Error('Response too short');
    }

    // Check status flags as in Android
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
        const transaction = processBlock(rawBlock, previousBalance);
        transactions.push(transaction);
        previousBalance = rawBlock.balance;
      } catch (error) {
        console.error('Error parsing block:', error);
      }
    }

    return transactions;
  }, [parseBlock, processBlock]);

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

      // Request NFC permissions with specific technologies
      if ('NDEFReader' in window) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const nfc = (window as any).navigator.nfc;
          await nfc.requestPermission({ name: "NFC", type: "nfc-f" });
        } catch (error) {
          console.error('NFC permission error:', error);
        }
      }

      const ndef = new NDEFReader();
      
      try {
        // Configure scan options specifically for NFC-F (FeliCa)
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleReading = async (event: any) => {
        try {
          console.log('Card detected:', event);

          // Try to get raw tag information
          const tag = event.tag || event.message;
          if (!tag) {
            throw new Error('No tag information available');
          }

          // Get tag technology type
          const tech = tag.technology || 'unknown';
          console.log('Tag technology:', tech);

          // Create command for reading the card
          const numberOfBlocks = 10;
          const command = new Uint8Array(numberOfBlocks * 2 + 14);
          
          // Command structure following Android implementation
          command[0] = command.length;  // Length
          command[1] = 0x06;           // Command code
          
          // Fill IDm (if available)
          if (tag.id) {
            command.set(new Uint8Array(tag.id), 2);
          }
          
          // Service code and number of blocks
          command[10] = 0x01;          // Number of services
          command[11] = SERVICE_CODE & 0xFF;
          command[12] = (SERVICE_CODE >> 8) & 0xFF;
          command[13] = numberOfBlocks;  // Number of blocks to read

          // Block list
          for (let i = 0; i < numberOfBlocks; i++) {
            const offset = 14 + (i * 2);
            command[offset] = 0x80;    // Block list element flag
            command[offset + 1] = i;    // Block number
          }

          console.log('Sending command:', bytesToHex(command));

          // Try different methods to communicate with the card
          let response;
          if (tag.transceive) {
            response = await tag.transceive(command);
          } else if (tag.sendCommand) {
            response = await tag.sendCommand(command);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } else if ((tag as any).felica?.sendCommand) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response = await (tag as any).felica.sendCommand(command);
          } else {
            throw new Error('Card communication not supported');
          }

          const responseArray = new Uint8Array(response);
          console.log('Received response:', bytesToHex(responseArray));

          const parsedTransactions = parseResponse(responseArray);
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

      ndef.addEventListener("reading", handleReading);

      return () => {
        ndef.removeEventListener("reading", handleReading);
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
  }, [isSupported, isReading, parseResponse, bytesToHex]);

  return {
    cardState,
    transactions,
    readCard,
    clearCache: useCallback(() => {
      localStorage.removeItem('dhaka-mrt-companion-data');
      setTransactions([]);
      setCardState({ type: 'waitingForTap' });
    }, []),
    isSupported,
    isReading
  };
}