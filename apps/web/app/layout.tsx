import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stoa — Agent Commerce Stack for Pharos",
  description:
    "Composable skills that let any Pharos agent get paid, pay other agents, prove who it is, and settle work through on-chain escrow.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <WalletProvider>
          <ToastProvider>
            <Navbar />
            {children}
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
