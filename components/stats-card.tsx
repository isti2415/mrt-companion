import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types";
import { useTranslations } from "next-intl";

interface StatsCardProps {
  transactions: Transaction[];
  locale: "en"|"bn";
}

export function StatsCard({ transactions, locale }: StatsCardProps) {
  const t = useTranslations();

  const stats = transactions.reduce((acc, transaction) => {
    if (transaction.transactionType === 'FARE') {
      acc.totalSpent += transaction.amount;
      acc.journeys++;
    } else {
      acc.totalRecharge += transaction.amount;
    }
    return acc;
  }, {
    totalSpent: 0,
    totalRecharge: 0,
    journeys: 0
  });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t('stats.totalSpent')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ৳ {stats.totalSpent.toLocaleString(locale)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t('stats.totalRecharge')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">
            ৳ {stats.totalRecharge.toLocaleString(locale)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t('stats.journeys')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.journeys.toLocaleString(locale)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}