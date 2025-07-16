"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThaiHandLogo } from "@/components/thai-hand-logo"
import { Plus, User, LogOut, ShoppingBag, Plane, CheckCircle } from "lucide-react"
import NotificationDropdown from './NotificationDropdown';
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface SimpleNavigationProps {
  user?: {
    name: string
    avatar?: string
  } | null
  onLogout?: () => void
}

export function SimpleNavigation({ user, onLogout }: SimpleNavigationProps) {
  return (
    <header className="backdrop-blur-xl bg-white/60 border-b border-white/40 shadow-lg sticky top-0 z-40 transition-all w-full">
      <div className="w-full h-20 flex items-center px-0">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-4 px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <ThaiHandLogo className="h-9 w-9 drop-shadow" />
            <div className="hidden sm:block">
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-400 bg-clip-text text-transparent tracking-tight group-hover:scale-105 transition">ฝากซื้อไทย</h1>
              <p className="text-xs text-gray-400 font-mono">ฝากซื้อข้ามประเทศ</p>
            </div>
          </Link>
          {/* Navigation */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/marketplace">
              <Button variant="ghost" className="rounded-full flex items-center gap-2 px-4 py-2 font-semibold hover:bg-blue-50/60 transition">
                <ShoppingBag className="h-5 w-5" />
                <span className="hidden sm:inline">ดูรายการ</span>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="rounded-full flex items-center gap-2 px-4 py-2 font-semibold hover:bg-indigo-50/60 transition">
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/create-request">
              <Button variant="default" className="rounded-full flex items-center gap-2 px-4 py-2 font-semibold bg-gradient-to-r from-blue-400 via-indigo-400 to-pink-400 text-white shadow hover:scale-105 hover:shadow-xl transition">
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">สร้างรายการ</span>
              </Button>
            </Link>
            {/* Grouped Dropdown Menu (Radix UI DropdownMenu) */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button variant="ghost" className="rounded-full flex items-center gap-2 px-4 py-2 font-semibold hover:bg-yellow-50/60 transition">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="hidden sm:inline">เมนูของฉัน</span>
                  <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" className="bg-white rounded-md shadow-lg p-2 min-w-[180px] z-50">
                <DropdownMenu.Item asChild>
                  <Link href="/dashboard/items" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-green-100 transition">
                    <CheckCircle className="h-4 w-4" /> งานของฉัน
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link href="/my-carry-orders" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-pink-100 transition">
                    <Plane className="h-4 w-4" /> รับหิ้วของฉัน
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
            <NotificationDropdown />
            {user ? (
              <Button variant="ghost" onClick={onLogout} className="rounded-full hover:bg-red-50 transition p-2">
                <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition" />
              </Button>
            ) : (
              <Link href="/login">
                <Button className="rounded-full px-6 py-2 font-semibold bg-gradient-to-r from-blue-400 via-indigo-400 to-pink-400 text-white shadow hover:scale-105 hover:shadow-xl transition">เข้าสู่ระบบ</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
