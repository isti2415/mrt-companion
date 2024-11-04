// components/nfc-reader/index.tsx
import { useEffect } from 'react';
import { useNfcReader } from '@/hooks/use-nfc-reader';
import { useNfcAvailability } from '@/hooks/use-nfc-availability';
import { StatusCard } from './status-card';
import { TransactionList } from './transaction-list';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';

export default function NFCReader() {
    const {
        cardState,
        transactions,
        startReading,
        stopReading,
        isReading
    } = useNfcReader();

    const { 
        isAvailable, 
        permission, 
        requestPermission, 
        error: nfcError 
    } = useNfcAvailability();

    // Cleanup NFC reading on unmount
    useEffect(() => {
        return () => {
            stopReading();
        };
    }, [stopReading]);

    // If there's a critical NFC error, show an alert
    if (nfcError) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
                <Card className="w-full max-w-md p-6">
                    <Alert variant="destructive">
                        <AlertDescription>
                            {nfcError}
                        </AlertDescription>
                    </Alert>
                </Card>
            </div>
        );
    }

    // Main reader UI
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-md mx-auto space-y-6">
                {/* Status Card */}
                <StatusCard 
                    state={cardState}
                    onStartReading={isAvailable && !isReading ? startReading : undefined}
                    onRequestPermission={
                        !isAvailable && permission === 'prompt' ? requestPermission : undefined
                    }
                    permission={permission}
                />

                {/* Transaction List - only show if we have transactions */}
                {transactions.length > 0 && (
                    <TransactionList 
                        transactions={transactions} 
                    />
                )}
            </div>
        </div>
    );
}