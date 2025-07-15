"use client"

import { useState, useMemo } from "react"
import { MapPin, Clock, ShoppingBag, User2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SimpleNavigation } from "@/components/simple-navigation"
import { SearchFilters, type FilterState } from "@/components/search-filters"
import { useSession, signOut } from "next-auth/react"

interface Request {
  id: number
  title: string
  description: string
  budget: number
  fromLocation: string
  toLocation: string
  deadline: string
  urgent: boolean
  requesterName: string
  requesterLine: string
  createdAt: string
  createdDate: Date
}

export default function MarketplacePage() {
  const { data: session } = useSession();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    fromLocation: "",
    toLocation: "",
    minBudget: "",
    maxBudget: "",
    urgent: "",
    sortBy: "newest",
  })

  // TODO: ดึงข้อมูลจาก API จริงที่นี่
  const allRequests: Request[] = []

  const filteredAndSortedRequests = useMemo(() => {
    const filtered = allRequests.filter((request) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch =
          request.title.toLowerCase().includes(searchTerm) || request.description.toLowerCase().includes(searchTerm)
        if (!matchesSearch) return false
      }

      // Location filters
      if (filters.fromLocation && !request.fromLocation.includes(filters.fromLocation)) {
        return false
      }
      if (filters.toLocation && !request.toLocation.includes(filters.toLocation)) {
        return false
      }

      // Budget filters
      if (filters.minBudget && request.budget < Number.parseInt(filters.minBudget)) {
        return false
      }
      if (filters.maxBudget && request.budget > Number.parseInt(filters.maxBudget)) {
        return false
      }

      // Urgent filter
      if (filters.urgent !== "") {
        const isUrgent = filters.urgent === "true"
        if (request.urgent !== isUrgent) return false
      }

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return b.createdDate.getTime() - a.createdDate.getTime()
        case "oldest":
          return a.createdDate.getTime() - b.createdDate.getTime()
        case "budget-high":
          return b.budget - a.budget
        case "budget-low":
          return a.budget - b.budget
        case "urgent":
          if (a.urgent && !b.urgent) return -1
          if (!a.urgent && b.urgent) return 1
          return b.createdDate.getTime() - a.createdDate.getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [filters])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <SimpleNavigation user={session?.user ? { name: session.user.name ?? "", avatar: session.user.image ?? undefined } : undefined} onLogout={() => signOut()} />

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-gray-900 flex items-center gap-2">
              <ShoppingBag className="h-7 w-7 text-blue-500" /> รายการรับหิ้ว
            </h1>
            <p className="text-gray-500 text-base">รวมข้อเสนอรับหิ้วของฝากจากนักเดินทางทั่วโลก</p>
          </div>
          {/* ปุ่มสร้างข้อเสนอใหม่ (option) */}
          {/* <Button className="rounded-xl px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow font-semibold text-base">+ เสนอรับหิ้ว</Button> */}
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <SearchFilters onFiltersChange={setFilters} totalResults={filteredAndSortedRequests.length} />
        </div>

        {/* Results */}
        {filteredAndSortedRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <ShoppingBag className="h-16 w-16 text-blue-200 mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">ยังไม่มีข้อเสนอรับหิ้ว</h3>
            <p className="text-gray-400 mb-4">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่ หรือรอให้นักเดินทางมาเสนอรับหิ้วเร็ว ๆ นี้</p>
            {/* <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2">+ เสนอรับหิ้ว</Button> */}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedRequests.map((request) => (
              <Card key={request.id} className="rounded-2xl shadow-xl bg-white/70 border-0 hover:shadow-2xl transition group backdrop-blur-md">
                <CardContent className="p-7">
                  <div className="flex items-center gap-2 mb-2">
                    {request.urgent && <Badge variant="destructive" className="mr-2">ด่วน</Badge>}
                    <span className="text-xs text-gray-400">{request.createdAt}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{request.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{request.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{request.fromLocation} → {request.toLocation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Clock className="h-4 w-4" />
                    <span>ภายใน {request.deadline}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <User2 className="h-4 w-4" />
                    <span>โดย {request.requesterName}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-xl font-bold text-blue-600">฿{request.budget.toLocaleString()}</p>
                    </div>
                    <Button size="sm" className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow">ติดต่อ</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
