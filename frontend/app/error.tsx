'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">เกิดข้อผิดพลาด</h2>
        <p className="text-gray-600 mb-4">ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด</p>
        <button
          onClick={reset}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          ลองใหม่
        </button>
      </div>
    </div>
  )
} 