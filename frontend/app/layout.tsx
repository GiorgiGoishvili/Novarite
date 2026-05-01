import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import NovariteWalletProvider from "../components/WalletProvider";
import { AuthProvider } from "../components/AuthProvider";
import { ProfileProvider } from "../context/ProfileContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
  title: "Novarite — Upload, Share & Discover Indie Games",
  description:
    "A home for indie game developers. Upload games from any engine — HTML5, Godot, Unity, Unreal, WebGL, ZIP — share them with players, and optionally sell access passes on Solana.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="bg-white text-nr-ink antialiased">
        <AuthProvider>
          <ProfileProvider>
            <NovariteWalletProvider>{children}</NovariteWalletProvider>
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
