import { Transaction } from ".";

export interface NFCReaderConfig {
    retryAttempts: number;
    readTimeout: number;
    serviceCode: number;
    blockCount: number;
}

export interface NFCReadResult {
    success: boolean;
    error?: string;
    data?: Uint8Array;
    transactions?: Transaction[]
}

export interface CommandConfig {
    idm: Uint8Array;
    serviceCode: number;
    blockCount: number;
}