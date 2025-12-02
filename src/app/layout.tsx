import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SidebarLeft from "@/components/SidebarLeft";
import SidebarRight from "@/components/SidebarRight";
import DayNightCycle from "@/components/DayNightCycle";
import RetroTerminal from "@/components/RetroTerminal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "aspinojony的小站",
  description: "探索技术、设计与未来的个人博客",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <Navbar />
        <DayNightCycle />
        <RetroTerminal />
        <div className="main-layout" style={{ marginTop: '80px' }}>
          <SidebarLeft />
          <main style={{ minWidth: 0 }}>{children}</main>
          <SidebarRight />
        </div>
      </body>
    </html>
  );
}
