import { motion } from "framer-motion";
import { Transaction } from "@/types";
import { useTranslations } from "next-intl";
import { ArrowRightIcon } from "lucide-react";

interface TransactionItemProps {
  transaction: Transaction;
  index: number;
  locale: "en" | "bn";
}

export function TransactionItem({ transaction, index, locale }: TransactionItemProps) {
  const t = useTranslations();

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 border-b last:border-b-0"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          {transaction.transactionType === 'FARE' ? (
            <>
              <div className="flex items-center space-x-2 font-medium">
                <span>{transaction.fromStation[locale]}</span>
                <ArrowRightIcon className="w-4 h-4" />
                <span>{transaction.toStation[locale]}</span>
              </div>
              <div className="text-sm text-destructive">
                -৳ {transaction.amount.toLocaleString(locale)}
              </div>
            </>
          ) : (
            <>
              <div className="font-medium">
                {t('transactions.recharge')}
              </div>
              <div className="text-sm text-green-600 dark:text-green-500">
                +৳ {transaction.amount.toLocaleString(locale)}
              </div>
            </>
          )}
          <div className="text-xs text-muted-foreground">
            {new Date(transaction.timestamp).toLocaleString(locale)}
          </div>
        </div>
        
        <div className="text-right">
          <div className="font-medium">
            ৳ {transaction.balance.toLocaleString(locale)}
          </div>
          <div className="text-xs text-muted-foreground">
            {t('transactions.balance')}
          </div>
        </div>
      </div>
    </motion.div>
  );
}