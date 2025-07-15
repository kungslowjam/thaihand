"use client";

import { ArrowRight, Globe, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { SimpleNavigation } from "@/components/simple-navigation"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"

export default function HomePage() {
  const { data: session } = useSession();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <SimpleNavigation user={session?.user ? { name: session.user.name ?? "", avatar: session.user.image ?? undefined } : undefined} onLogout={() => signOut()} />

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">เชื่อมโยงคนไทยทั่วโลก</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            แพลตฟอร์มฝากซื้อข้ามประเทศ เชื่อมต่อคนไทยในต่างแดนกับคนในประเทศ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace">
              <Button size="lg" className="text-lg px-8">
                เริ่มใช้งาน <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">ทำไมต้องเลือกเรา?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>ปลอดภัย</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">ระบบที่ปลอดภัย เชื่อถือได้</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>เชื่อถือได้</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">คนช่วยที่ผ่านการตรวจสอบ</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>ทั่วโลก</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">บริการครอบคลุมทั่วโลก</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 ฝากซื้อไทย. สงวนลิขสิทธิ์.</p>
        </div>
      </footer>
    </div>
  )
}
