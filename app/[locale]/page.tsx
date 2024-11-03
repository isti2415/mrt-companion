"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useMrt } from "@/hooks/use-mrt";
import { CardDisplay } from "@/components/card-display";
import { TransactionList } from "@/components/transaction-list";
import { StatsCard } from "@/components/stats-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InfoIcon, TrashIcon, RefreshCwIcon, HistoryIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { LanguageToggle } from "@/components/language-toggle";
import { ModeToggle } from "@/components/mode-toggle";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

interface HomePageProps {
  params: {
    locale: "en" | "bn";
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function HomePage({ params }: HomePageProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const {
    cardState,
    transactions,
    readCard,
    clearCache,
    isSupported,
    isReading,
  } = useMrt();

  const handleClearHistory = () => {
    clearCache();
    setShowClearDialog(false);
    toast({
      title: t("notifications.historyCleared"),
      description: t("notifications.historyClearedDesc"),
    });
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">{t("app.title")}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <LanguageToggle />
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-6 md:py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mx-auto space-y-8"
          >
            <AnimatePresence>
              {!isSupported && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  variants={itemVariants}
                >
                  <Alert variant="destructive">
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>{t("app.nfcError")}</AlertTitle>
                    <AlertDescription>{t("app.nfcErrorDesc")}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={itemVariants}>
              <CardDisplay
                cardState={cardState}
                onTap={readCard}
                isReading={isReading}
              />
            </motion.div>

            {transactions.length > 0 && (
              <>
                <motion.div variants={itemVariants}>
                  <StatsCard
                    transactions={transactions}
                    locale={params.locale}
                  />
                </motion.div>

                <Separator />

                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HistoryIcon className="w-5 h-5" />
                      <h2 className="text-lg font-semibold">
                        {t("transactions.title")}
                      </h2>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={readCard}
                        disabled={isReading}
                      >
                        <RefreshCwIcon className="w-4 h-4 mr-2" />
                        {t("actions.refresh")}
                      </Button>

                      <AlertDialog
                        open={showClearDialog}
                        onOpenChange={setShowClearDialog}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                          >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            {t("actions.clearHistory")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("dialogs.clearHistory.title")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("dialogs.clearHistory.description")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t("actions.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleClearHistory}
                              className="bg-destructive text-destructive-foreground"
                            >
                              {t("actions.clear")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <TransactionList
                    transactions={transactions}
                    locale={params.locale}
                  />
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {t("footer.createdBy")}{" "}
            <a
              href="https://github.com/istiaq-ahmed"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Istiaq Ahmed
            </a>
          </p>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {t("footer.inspiredBy")}{" "}
            <a
              href="https://linktr.ee/tuxboy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Ani
            </a>
            {t("footer.originalWork")}
          </p>
        </div>
      </footer>
    </div>
  );
}