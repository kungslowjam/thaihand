import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import SessionProviderWrapper from "@/components/SessionProviderWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ฝากซื้อไทย - เชื่อมโยงคนไทยทั่วโลก",
  description: "แพลตฟอร์มฝากซื้อข้ามประเทศ เชื่อมต่อคนไทยในต่างแดนกับคนในประเทศ",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
