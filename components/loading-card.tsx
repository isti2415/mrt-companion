"use client"

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center"
          >
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-4 w-24 mt-2" />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}