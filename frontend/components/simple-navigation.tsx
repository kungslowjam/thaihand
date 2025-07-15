"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThaiHandLogo } from "@/components/thai-hand-logo"
import { Plus, User, LogOut } from "lucide-react"

interface SimpleNavigationProps {
  user?: {
    name: string
    avatar?: string
  } | null
  onLogout?: () => void
}

export function SimpleNavigation({ user, onLogout }: SimpleNavigationProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <ThaiHandLogo className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">ฝากซื้อไทย</h1>
              <p className="text-xs text-gray-500">ฝากซื้อข้ามประเทศ</p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <Link href="/marketplace">
              <Button variant="ghost">ดูรายการ</Button>
            </Link>

            {user ? (
              <>
                <Link href="/create-request">
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>สร้างรายการ</span>
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span>{user.name}</span>
                  </Button>
                </Link>
                <Button variant="ghost" onClick={onLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button>เข้าสู่ระบบ</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
