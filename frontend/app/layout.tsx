import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import SessionProviderWrapper from "@/components/SessionProviderWrapper"
import { Toaster } from "sonner"
import { useNotificationStore } from "@/store/notificationStore";
import ToastNotification from "@/components/ToastNotification";
import ClientNavigation from "@/components/ClientNavigation";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ฝากซื้อไทย - เชื่อมโยงคนไทยทั่วโลก",
  description: "แพลตฟอร์มฝากซื้อข้ามประเทศ เชื่อมต่อคนไทยในต่างแดนกับคนในประเทศ",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <SessionProviderWrapper>
          <ClientNavigation />
          <main>
            {children}
          </main>
          <ToastNotification enable={true} />
          <Toaster richColors position="top-center" duration={2500} />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
