import { useNfcReader } from '@/hooks/use-nfc-reader';
import { StatusCard } from './status-card';
import { TransactionList } from './transaction-list';
import { useNfcAvailability } from '@/hooks/use-nfc-availability';

export default function NFCReader() {
    const {
        cardState,
        transactions,
        startReading,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        stopReading,
        isReading
    } = useNfcReader();

    const { permission, requestPermission } = useNfcAvailability();

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-md mx-auto space-y-6">
                <StatusCard 
                    state={cardState}
                    onStartReading={!isReading ? startReading : undefined}
                    onRequestPermission={requestPermission}
                    permission={permission}
                />
                <TransactionList transactions={transactions} />
            </div>
        </div>
    );
}