import { Transaction } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionListProps {
    transactions: Transaction[];
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
    if (!transactions.length) return null;

    return (
        <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
            <AnimatePresence mode="popLayout">
                {transactions.map((transaction, index) => (
                    <motion.div
                        key={`${transaction.timestamp}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-lg shadow-md p-4"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500">{transaction.timestamp}</p>
                                <div className="mt-1">
                                    <p className="font-medium">{transaction.fromStation}</p>
                                    {transaction.toStation !== "Unknown Station (0)" && (
                                        <p className="text-gray-600">To: {transaction.toStation}</p>
                                    )}
                                </div>
                            </div>
                            <p className="text-lg font-semibold">
                                ৳{transaction.balance.toLocaleString()}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};