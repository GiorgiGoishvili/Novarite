import type { Metadata } from "next";
import { Cinzel, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import NovariteWalletProvider from "../components/WalletProvider";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Novarite — The Indie Game Platform on Solana",
  description:
    "Publish indie games. Sell on-chain access passes. Reward early supporters. Build owned communities — powered by Solana.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${inter.variable} ${mono.variable}`}
    >
      <body className="bg-nr-void text-nr-bone antialiased">
        <NovariteWalletProvider>{children}</NovariteWalletProvider>
      </body>
    </html>
  );
}
