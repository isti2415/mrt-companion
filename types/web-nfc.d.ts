interface NDEFRecord {
    recordType: string;
    mediaType?: string;
    id?: string;
    data?: DataView | string;
    encoding?: string;
    lang?: string;
  }
  
  interface NDEFMessage {
    records: NDEFRecord[];
  }
  
  interface NDEFReadingEvent {
    serialNumber: string;
    message: NDEFMessage;
  }
  
  interface NDEFReader extends EventTarget {
    scan: () => Promise<void>;
    write: (message: NDEFMessage) => Promise<void>;
    addEventListener(
      type: 'reading',
      callback: (event: NDEFReadingEvent) => void
    ): void;
    addEventListener(
      type: 'readingerror',
      callback: (error: Error) => void
    ): void;
    removeEventListener(
      type: 'reading',
      callback: (event: NDEFReadingEvent) => void
    ): void;
    removeEventListener(
      type: 'readingerror',
      callback: (error: Error) => void
    ): void;
  }
  
  declare const NDEFReader: {
    prototype: NDEFReader;
    new(): NDEFReader;
  };