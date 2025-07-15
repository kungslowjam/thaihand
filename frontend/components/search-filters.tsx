"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, X, SlidersHorizontal } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SearchFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  totalResults: number
}

export interface FilterState {
  search: string
  fromLocation: string
  toLocation: string
  minBudget: string
  maxBudget: string
  urgent: string
  sortBy: string
}

const initialFilters: FilterState = {
  search: "",
  fromLocation: "",
  toLocation: "",
  minBudget: "",
  maxBudget: "",
  urgent: "",
  sortBy: "newest",
}

export function SearchFilters({ onFiltersChange, totalResults }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    setFilters(initialFilters)
    onFiltersChange(initialFilters)
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => key !== "sortBy" && value !== "")

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => key !== "sortBy" && value !== "").length
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ค้นหาสินค้า เช่น ขนมทองม่วน, ยาหม่อง..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <SlidersHorizontal className="h-4 w-4" />
                ตัวกรอง
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location Filters */}
              <div className="space-y-2">
                <Label>ซื้อจาก</Label>
                <Select
                  value={filters.fromLocation}
                  onValueChange={(value) => handleFilterChange("fromLocation", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกพื้นที่" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกพื้นที่</SelectItem>
                    <SelectItem value="กรุงเทพฯ">กรุงเทพฯ</SelectItem>
                    <SelectItem value="เชียงใหม่">เชียงใหม่</SelectItem>
                    <SelectItem value="ภูเก็ต">ภูเก็ต</SelectItem>
                    <SelectItem value="ขอนแก่น">ขอนแก่น</SelectItem>
                    <SelectItem value="หาดใหญ่">หาดใหญ่</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ส่งไป</Label>
                <Select value={filters.toLocation} onValueChange={(value) => handleFilterChange("toLocation", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกปลายทาง" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกปลายทาง</SelectItem>
                    <SelectItem value="ลอนดอน">ลอนดอน, UK</SelectItem>
                    <SelectItem value="โตเกียว">โตเกียว, ญี่ปุ่น</SelectItem>
                    <SelectItem value="ซิดนีย์">ซิดนีย์, ออสเตรเลีย</SelectItem>
                    <SelectItem value="ปารีส">ปารีส, ฝรั่งเศส</SelectItem>
                    <SelectItem value="นิวยอร์ก">นิวยอร์ก, สหรัฐฯ</SelectItem>
                    <SelectItem value="สิงคโปร์">สิงคโปร์</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Budget Range */}
              <div className="space-y-2">
                <Label>งบประมาณ (บาท)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="ต่ำสุด"
                    value={filters.minBudget}
                    onChange={(e) => handleFilterChange("minBudget", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="สูงสุด"
                    value={filters.maxBudget}
                    onChange={(e) => handleFilterChange("maxBudget", e.target.value)}
                  />
                </div>
              </div>

              {/* Status & Sort */}
              <div className="space-y-2">
                <Label>สถานะ</Label>
                <Select value={filters.urgent} onValueChange={(value) => handleFilterChange("urgent", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="ทุกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกสถานะ</SelectItem>
                    <SelectItem value="true">ด่วน</SelectItem>
                    <SelectItem value="false">ปกติ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sort and Clear */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Label>เรียงตาม:</Label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">ใหม่ล่าสุด</SelectItem>
                    <SelectItem value="oldest">เก่าสุด</SelectItem>
                    <SelectItem value="budget-high">งบสูงสุด</SelectItem>
                    <SelectItem value="budget-low">งบต่ำสุด</SelectItem>
                    <SelectItem value="urgent">ด่วนก่อน</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2 bg-transparent">
                  <X className="h-4 w-4" />
                  ล้างตัวกรอง
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Results Count */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            พบ <span className="font-semibold">{totalResults}</span> รายการ
            {hasActiveFilters && " (กรองแล้ว)"}
          </p>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  ค้นหา: {filters.search}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("search", "")} />
                </Badge>
              )}
              {filters.fromLocation && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  จาก: {filters.fromLocation}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("fromLocation", "")} />
                </Badge>
              )}
              {filters.toLocation && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  ไป: {filters.toLocation}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("toLocation", "")} />
                </Badge>
              )}
              {(filters.minBudget || filters.maxBudget) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  งบ: {filters.minBudget || "0"}-{filters.maxBudget || "∞"}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      handleFilterChange("minBudget", "")
                      handleFilterChange("maxBudget", "")
                    }}
                  />
                </Badge>
              )}
              {filters.urgent && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.urgent === "true" ? "ด่วน" : "ปกติ"}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("urgent", "")} />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
