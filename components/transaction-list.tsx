import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Transaction } from "@/types";
import { TransactionItem } from "./transaction-item";
import { useTranslations } from "next-intl";

interface TransactionListProps {
  transactions: Transaction[];
  locale: "en"|"bn";
}

export function TransactionList({ transactions, locale }: TransactionListProps) {
  const t = useTranslations();

  if (!transactions.length) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('transactions.title')}</CardTitle>
          <CardDescription>
            {t('transactions.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {transactions.map((transaction, index) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                index={index}
                locale={locale}
              />
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}