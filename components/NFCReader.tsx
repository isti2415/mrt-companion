import { useNfcReader } from '@/hooks/use-nfc-reader';
import { StatusCard } from './status-card';
import { TransactionList } from './transaction-list';

export default function NFCReader() {
    const {
        cardState,
        transactions,
        startReading,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        stopReading,
        isReading
    } = useNfcReader();

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-md mx-auto space-y-6">
                <StatusCard 
                    state={cardState}
                    onStartReading={!isReading ? startReading : undefined}
                />
                <TransactionList transactions={transactions} />
            </div>
        </div>
    );
}