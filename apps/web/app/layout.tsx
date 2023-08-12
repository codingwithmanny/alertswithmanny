// Imports
// ========================================================
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import QueryProvider from "./provider/query";

// Config
// ========================================================
const inter = Inter({ subsets: ["latin"] });

// Metadata
// ========================================================
export const metadata: Metadata = {
  title: "Alerts with Manny",
  description: "Know when something happens...",
};

// Main Layout Component
// ========================================================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
