"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThaiHandLogo } from "@/components/thai-hand-logo"
import { Plus, User, LogOut, ShoppingBag, Plane, CheckCircle, Moon, Sun } from "lucide-react"
import NotificationDropdown from './NotificationDropdown';
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { signIn } from "next-auth/react";

interface SimpleNavigationProps {
  user?: {
    name: string
    avatar?: string
  } | null
  onLogout?: () => void
}

export function SimpleNavigation({ user, onLogout }: SimpleNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (saved) return saved
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })

  // apply theme to <html>
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }

  function toggleTheme() {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      if (typeof window !== 'undefined') localStorage.setItem('theme', next)
      return next
    })
  }
  return (
    <nav className="w-full bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2 gap-2">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/thaihand-logo.png" alt="logo" className="w-10 h-10 rounded-full shadow border" />
          <span className="font-extrabold text-xl bg-gradient-to-r from-blue-500 to-pink-400 bg-clip-text text-transparent group-hover:scale-105 transition">ฝากซื้อไทย</span>
        </Link>
        {/* Desktop Menu (center, ว่างไว้หรือใส่เมนูอื่นในอนาคต) */}
        <div className="hidden md:flex items-center justify-center gap-2"></div>
        {/* Right: Notification + Dropdown + User */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'โหมดสว่าง' : 'โหมดมืด'}
            className="rounded-full p-2 border border-gray-200 hover:bg-gray-100 transition"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="rounded-full flex items-center gap-2 px-4 py-2 font-semibold border shadow hover:bg-gray-100 transition">
                <ShoppingBag className="h-5 w-5" />
                <span className="hidden sm:inline">เมนูของฉัน</span>
                <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" className="bg-white rounded-xl shadow-xl p-2 min-w-[200px] z-50 border border-gray-100 animate-fade-in">
              <DropdownMenu.Item asChild>
                <Link href="/marketplace" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-100 transition font-medium">
                  <ShoppingBag className="h-4 w-4" /> ดูรายการ
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link href="/create-request" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-pink-100 transition font-medium">
                  <Plus className="h-4 w-4" /> สร้างรายการ
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link href="/dashboard/items" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-100 transition font-medium">
                  <CheckCircle className="h-4 w-4" /> งานของฉัน
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-100 transition font-medium">
                  <User className="h-4 w-4" /> Dashboard
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <NotificationDropdown />
          {user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="user" className="w-9 h-9 rounded-full object-cover border" />
                  ) : (
                    <User className="h-6 w-6 text-gray-500" />
                  )}
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" className="bg-white rounded-xl shadow-xl p-2 min-w-[140px] z-50 border border-gray-100 animate-fade-in">
                <DropdownMenu.Item asChild>
                  <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-100 text-red-600 transition w-full font-medium">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
                    ออกจากระบบ
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          ) : (
            <Button
              className="rounded-full px-6 py-2 font-semibold bg-gradient-to-r from-blue-400 via-indigo-400 to-pink-400 text-white shadow hover:scale-105 hover:shadow-xl transition"
              onClick={() => signIn()}
            >
              เข้าสู่ระบบ
            </Button>
          )}
        </div>
      </div>
      {/* Mobile Menu Slide-down */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow animate-fade-in flex flex-col gap-1 px-4 py-3">
          <Link href="/marketplace" className="nav-link block">ดูรายการ</Link>
          <Link href="/dashboard/items" className="nav-link block">งานของฉัน</Link>
          <Link href="/dashboard" className="nav-link block">Dashboard</Link>
          <Link href="/create-request">
            <button className="rounded-full bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 font-semibold shadow w-full mt-1">+ สร้างรายการ</button>
          </Link>
        </div>
      )}
      {/* Floating Action Button (Mobile) */}
      <Link href="/create-request" className="md:hidden fixed bottom-6 right-6 z-50">
        <button className="rounded-full bg-gradient-to-r from-blue-400 to-pink-400 text-white p-4 shadow-xl hover:scale-110 transition flex items-center gap-2">
          <Plus className="h-6 w-6" />
        </button>
      </Link>
    </nav>
  );
}

// tailwindcss: nav-link
// .nav-link { @apply rounded-full px-4 py-2 font-medium text-gray-700 hover:bg-blue-50 transition; }
