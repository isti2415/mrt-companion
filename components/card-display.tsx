import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NfcIcon, RefreshCwIcon } from "lucide-react";
import { CardState } from "@/types";
import { useTranslations } from "next-intl";

interface CardDisplayProps {
  cardState: CardState;
  onTap: () => void;
  isReading: boolean;
}

export function CardDisplay({ cardState, onTap, isReading }: CardDisplayProps) {
  const t = useTranslations();

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        <CardContent className="p-6 relative">
          <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
            {cardState.type === 'balance' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-2"
              >
                <div className="text-muted-foreground">
                  {t('card.currentBalance')}
                </div>
                <div className="text-4xl font-bold">
                  ৳ {cardState.amount.toLocaleString('bn-BD')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t('card.lastRead')}: {
                    new Date(cardState.lastRead).toLocaleString('bn-BD')
                  }
                </div>
              </motion.div>
            )}

            {cardState.type === 'reading' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCwIcon className="w-12 h-12 text-primary" />
              </motion.div>
            )}

            {cardState.type === 'waitingForTap' && (
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-center space-y-4"
              >
                <NfcIcon className="w-12 h-12 text-primary mx-auto" />
                <div className="text-muted-foreground">
                  {t('card.waitingForTap')}
                </div>
              </motion.div>
            )}

            {cardState.type === 'error' && (
              <motion.div
                initial={{ x: 20 }}
                animate={{ x: 0 }}
                className="text-destructive text-center space-y-2"
              >
                <div className="font-semibold">{t('card.error')}</div>
                <div className="text-sm">{cardState.message}</div>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <Button 
              className="w-full" 
              onClick={onTap}
              disabled={isReading}
              variant={cardState.type === 'error' ? "destructive" : "default"}
            >
              {isReading ? t('card.reading') : t('card.tapToRead')}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}