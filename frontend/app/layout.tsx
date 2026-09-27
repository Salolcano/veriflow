import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VeriFlow",
  description: "Real world event verification powered by GenLayer"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
