
import { NFCReaderConfig, NFCReadResult } from '../types/reader';
import { NFC_CONSTANTS } from '../constants/nfc';
import { NFCLogger } from './TransactionParser';
import { CommandBuilder } from '@/utils/command-builder';

export class NFCReader {
    private ndef: NDEFReader | null = null;
    private abortController: AbortController | null = null;
    private config: NFCReaderConfig;

    constructor(config?: Partial<NFCReaderConfig>) {
        this.config = {
            retryAttempts: config?.retryAttempts ?? NFC_CONSTANTS.DEFAULT_RETRY_ATTEMPTS,
            readTimeout: config?.readTimeout ?? NFC_CONSTANTS.DEFAULT_TIMEOUT,
            serviceCode: config?.serviceCode ?? NFC_CONSTANTS.SERVICE_CODE,
            blockCount: config?.blockCount ?? NFC_CONSTANTS.DEFAULT_BLOCKS_TO_READ
        };
    }

    async initialize(): Promise<boolean> {
        try {
            if (!('NDEFReader' in window)) {
                throw new Error('NFC not supported');
            }

            this.ndef = new NDEFReader();
            await this.ndef.scan();
            NFCLogger.info('NFC initialized successfully');
            return true;

        } catch (error) {
            NFCLogger.error('Failed to initialize NFC', error);
            return false;
        }
    }

    private async waitForTag(timeoutMs: number): Promise<string> {
        if (!this.ndef) {
            throw new Error('NFC not initialized');
        }

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                cleanup();
                reject(new Error('Timeout waiting for tag'));
            }, timeoutMs);

            const handleReading = (event: NFCReadingEvent) => {
                cleanup();
                resolve(event.serialNumber);
            };

            const handleError = (error: NFCErrorEvent) => {
                cleanup();
                reject(error);
            };

            const cleanup = () => {
                clearTimeout(timeoutId);
                this.ndef?.removeEventListener('reading', handleReading as EventListener);
                this.ndef?.removeEventListener('readingerror', handleError as EventListener);
            };

            this.ndef?.addEventListener('reading', handleReading as EventListener);
            this.ndef?.addEventListener('readingerror', handleError as EventListener);
        });
    }

    private async communicateWithCard(
        serialNumber: string,
        command: Uint8Array
    ): Promise<Uint8Array> {
        if (!this.ndef) {
            throw new Error('NFC not initialized');
        }

        this.abortController = new AbortController();

        try {
            // Create a custom NDEF record with our command
            const message = {
                records: [{
                    recordType: "mime",
                    mediaType: "application/x-felica",
                    data: command.buffer
                }]
            };

            // Send the command
            await this.ndef.write(message, { signal: this.abortController.signal });

            // Wait for and process the response
            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    cleanup();
                    reject(new Error('Timeout waiting for card response'));
                }, this.config.readTimeout);

                const handleReading = (event: NFCReadingEvent) => {
                    // Only process response from the same card
                    if (event.serialNumber !== serialNumber) {
                        return;
                    }

                    const record = event.message.records.find(
                        record => record.mediaType === 'application/x-felica'
                    );

                    if (record && record.data) {
                        cleanup();
                        resolve(new Uint8Array(record.data));
                    }
                };

                const cleanup = () => {
                    clearTimeout(timeoutId);
                    this.ndef?.removeEventListener('reading', handleReading as EventListener);
                };

                this.ndef?.addEventListener('reading', handleReading as EventListener);
            });
        } finally {
            this.abortController = null;
        }
    }

    async read(): Promise<NFCReadResult> {
        try {
            for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
                try {
                    NFCLogger.debug(`Read attempt ${attempt} of ${this.config.retryAttempts}`);

                    // Wait for a card to be presented
                    const serialNumber = await this.waitForTag(this.config.readTimeout);
                    
                    // Convert serial number to IDm
                    const idm = new TextEncoder().encode(serialNumber);

                    // Send polling command
                    const pollingCommand = CommandBuilder.buildPollingCommand();
                    await this.communicateWithCard(serialNumber, pollingCommand);

                    // Send read command
                    const readCommand = CommandBuilder.buildReadCommand({
                        idm,
                        serviceCode: this.config.serviceCode,
                        blockCount: this.config.blockCount
                    });

                    const response = await this.communicateWithCard(serialNumber, readCommand);

                    return {
                        success: true,
                        data: response
                    };

                } catch (error) {
                    if (attempt === this.config.retryAttempts) {
                        throw error;
                    }

                    NFCLogger.debug(`Attempt ${attempt} failed, retrying...`, error);
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
                }
            }

            throw new Error('Maximum retry attempts exceeded');

        } catch (error) {
            NFCLogger.error('Error reading NFC card', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        } finally {
            if (this.abortController) {
                this.abortController.abort();
                this.abortController = null;
            }
        }
    }

    cleanup(): void {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        this.ndef = null;
    }
}