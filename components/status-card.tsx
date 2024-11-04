import { CardState } from '@/types';
import { motion } from 'framer-motion';
import { 
    CreditCard, 
    WifiOff, 
    AlertTriangle, 
    Loader2, 
    Check 
} from 'lucide-react';

interface StatusCardProps {
    state: CardState;
    onStartReading?: () => void;
    onRequestPermission?: () => void;
    permission?: PermissionState;
}

const StatusIcon = ({ state }: { state: CardState }) => {
    switch (state.type) {
        case 'WaitingForTap':
            return <CreditCard className="w-12 h-12 text-blue-500" />;
        case 'Reading':
            return <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />;
        case 'NoNfcSupport':
        case 'NfcDisabled':
            return <WifiOff className="w-12 h-12 text-red-500" />;
        case 'Error':
            return <AlertTriangle className="w-12 h-12 text-red-500" />;
        case 'Balance':
            return <Check className="w-12 h-12 text-green-500" />;
    }
};

const StatusMessage = ({ state }: { state: CardState }) => {
    switch (state.type) {
        case 'WaitingForTap':
            return (
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800">Ready to Scan</h2>
                    <p className="text-gray-600 mt-1">Place your card near the device</p>
                </div>
            );
        case 'Reading':
            return (
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800">Reading Card</h2>
                    <p className="text-gray-600 mt-1">Please hold the card steady</p>
                </div>
            );
        case 'NoNfcSupport':
            return (
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600">NFC Not Supported</h2>
                    <p className="text-gray-600 mt-1">This device doesn&apos;t support NFC</p>
                </div>
            );
        case 'NfcDisabled':
            return (
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600">NFC Disabled</h2>
                    <p className="text-gray-600 mt-1">Please enable NFC in your device settings</p>
                </div>
            );
        case 'Error':
            return (
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600">Error</h2>
                    <p className="text-gray-600 mt-1">{state.message}</p>
                </div>
            );
        case 'Balance':
            return (
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800">Current Balance</h2>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                        ৳{state.amount.toLocaleString()}
                    </p>
                </div>
            );
    }
};

export const StatusCard = ({ 
    state, 
    onStartReading, 
    onRequestPermission,
    permission 
}: StatusCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
    >
        <div className="flex flex-col items-center space-y-4">
            <StatusIcon state={state} />
            <StatusMessage state={state} />
            
            {state.type === 'NoNfcSupport' && permission === 'prompt' && onRequestPermission && (
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onRequestPermission}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg font-medium
                             hover:bg-blue-600 transition-colors"
                >
                    Enable NFC
                </motion.button>
            )}
            
            {state.type === 'WaitingForTap' && onStartReading && (
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onStartReading}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg font-medium
                             hover:bg-blue-600 transition-colors"
                >
                    Start Scanning
                </motion.button>
            )}
        </div>
    </motion.div>
);