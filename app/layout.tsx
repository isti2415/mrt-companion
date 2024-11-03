import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Dhaka MRT Companion",
    template: "%s | Dhaka MRT Companion"
  },
  description: "A digital companion for Dhaka MRT commuters to check card balance and journey history",
  keywords: ["Dhaka MRT", "Metro Rail", "Transit Card", "Card Balance", "Journey History"],
  authors: [{ name: "Istiaq Ahmed" }],
  creator: "Istiaq Ahmed",
  publisher: "Istiaq Ahmed",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dhaka-mrt.vercel.app",
    title: "Dhaka MRT Companion",
    description: "Digital companion for Dhaka MRT commuters",
    siteName: "Dhaka MRT Companion",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dhaka MRT Companion",
    description: "Digital companion for Dhaka MRT commuters",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(
        inter.className,
        "min-h-screen bg-background antialiased"
      )}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}