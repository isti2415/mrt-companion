interface NFCRecord {
    recordType: string;
    mediaType?: string;
    id?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
    encoding?: string;
    lang?: string;
}

interface NFCMessage {
    records: NFCRecord[];
}

interface NFCReadingEvent extends Event {
    serialNumber: string;
    message: NFCMessage;
}

interface NFCErrorEvent extends Event {
    error: Error;
}

interface NFCReaderOptions {
    signal?: AbortSignal;
}

declare class NDEFReader extends EventTarget {
    constructor();
    
    scan(options?: NFCReaderOptions): Promise<void>;
    write(message: NFCMessage, options?: NFCReaderOptions): Promise<void>;

    addEventListener(
        type: 'reading',
        callback: (event: NFCReadingEvent) => void,
        options?: boolean | AddEventListenerOptions
    ): void;
    
    addEventListener(
        type: 'readingerror',
        callback: (event: NFCErrorEvent) => void,
        options?: boolean | AddEventListenerOptions
    ): void;

    removeEventListener(
        type: string,
        callback: (event: Event) => void,
        options?: boolean | EventListenerOptions
    ): void;
}

// Declare global Web NFC availability
interface Window {
    NDEFReader: typeof NDEFReader;
}