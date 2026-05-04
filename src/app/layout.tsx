import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { cn } from "~/lib/utils";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

export const metadata: Metadata = {
  title: "CETA | Tournament Bracket",
  description: "CETA Robotics 2026 Tournament Management System",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

import { ThemeProvider } from "~/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-mono", jetbrainsMono.variable)} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
