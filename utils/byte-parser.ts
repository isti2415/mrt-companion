export class ByteParser {
    toHexString(bytes: Uint8Array): string {
        return Array.from(bytes)
            .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
            .join(' ');
    }

    extractInt16(bytes: Uint8Array, offset: number = 0): number {
        return ((bytes[offset + 1] & 0xFF) << 8) | (bytes[offset] & 0xFF);
    }

    extractInt24(bytes: Uint8Array, offset: number = 0): number {
        return ((bytes[offset + 2] & 0xFF) << 16) |
               ((bytes[offset + 1] & 0xFF) << 8) |
               (bytes[offset] & 0xFF);
    }

    extractByte(bytes: Uint8Array, offset: number): number {
        return bytes[offset] & 0xFF;
    }
}