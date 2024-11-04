export class TimestampService {
    decodeTimestamp(value: number): string {
        const baseTime = Date.now() - (value * 60 * 1000);
        return new Date(baseTime).toISOString().slice(0, 16).replace('T', ' ');
    }
}