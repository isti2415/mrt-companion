import { Transaction } from '../types';
import { ByteParser } from '../utils/byte-parser';
import { StationService } from './StationService';
import { TimestampService } from './TimeStampService';

export class TransactionParser {
    constructor(
        private byteParser: ByteParser,
        private timestampService: TimestampService,
        private stationService: StationService
    ) {}

    parseTransactionResponse(response: Uint8Array): Transaction[] {
        const transactions: Transaction[] = [];
        console.debug("Response:", this.byteParser.toHexString(response));

        if (response.length < 13) {
            console.error("Response too short");
            return transactions;
        }

        const statusFlag1 = response[10];
        const statusFlag2 = response[11];

        if (statusFlag1 !== 0x00 || statusFlag2 !== 0x00) {
            console.error("Error reading card: Status flags", statusFlag1, statusFlag2);
            return transactions;
        }

        const numBlocks = response[12];
        const blockData = response.slice(13);
        const blockSize = 16;

        if (blockData.length < numBlocks * blockSize) {
            console.error("Incomplete block data");
            return transactions;
        }

        for (let i = 0; i < numBlocks; i++) {
            const offset = i * blockSize;
            const block = blockData.slice(offset, offset + blockSize);
            try {
                const transaction = this.parseTransactionBlock(block);
                transactions.push(transaction);
            } catch (error) {
                console.error(`Error parsing block ${i}:`, error);
                // Continue parsing other blocks
            }
        }

        return transactions;
    }

    private parseTransactionBlock(block: Uint8Array): Transaction {
        if (block.length !== 16) {
            throw new Error("Invalid block size");
        }

        try {
            // Extract fixed header (first 4 bytes)
            const fixedHeader = block.slice(0, 4);
            const fixedHeaderStr = this.byteParser.toHexString(fixedHeader);

            // Extract timestamp (2 bytes)
            const timestampValue = this.byteParser.extractInt16(block, 4);
            const timestamp = this.timestampService.decodeTimestamp(timestampValue);

            // Extract transaction type (2 bytes)
            const transactionTypeBytes = block.slice(6, 8);
            const transactionType = this.byteParser.toHexString(transactionTypeBytes);

            // Extract station codes (1 byte each)
            const fromStationCode = this.byteParser.extractByte(block, 8);
            const toStationCode = this.byteParser.extractByte(block, 10);

            // Extract balance (3 bytes)
            const balance = this.byteParser.extractInt24(block, 11);

            // Extract trailing bytes (2 bytes)
            const trailingBytes = block.slice(14, 16);
            const trailing = this.byteParser.toHexString(trailingBytes);

            // Get station names
            const fromStation = this.stationService.getStationName(fromStationCode);
            const toStation = this.stationService.getStationName(toStationCode);

            return {
                fixedHeader: fixedHeaderStr,
                timestamp,
                transactionType,
                fromStation,
                toStation,
                balance,
                trailing
            };
        } catch (error) {
            throw new Error(`Error parsing transaction block: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    validateResponse(response: Uint8Array): boolean {
        if (response.length < 13) return false;
        
        const statusFlag1 = response[10];
        const statusFlag2 = response[11];
        
        return statusFlag1 === 0x00 && statusFlag2 === 0x00;
    }
}

// Add error types for better error handling
export class TransactionParserError extends Error {
    constructor(
        message: string,
        public code: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public details?: any
    ) {
        super(message);
        this.name = 'TransactionParserError';
    }
}

// Add logger service for better debugging
export class NFCLogger {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static debug(message: string, data?: any): void {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(`[NFC] ${message}`, data);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static error(message: string, error?: any): void {
        console.error(`[NFC] ${message}`, error);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static info(message: string, data?: any): void {
        console.info(`[NFC] ${message}`, data);
    }
}