"use client";

import { LanguageToggle } from "@/components/language-toggle";
import { ModeToggle } from "@/components/mode-toggle";
import NFCReader from "@/components/NFCReader";
import { useTranslations } from "next-intl";

interface HomePageProps {
  params: {
    locale: "en" | "bn";
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function HomePage({ params }: HomePageProps) {
  const t = useTranslations();

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
          <NFCReader/>
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