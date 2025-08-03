'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">เกิดข้อผิดพลาดทั่วโลก</h2>
            <p className="text-gray-600 mb-4">ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด</p>
            <button
              onClick={reset}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </body>
    </html>
  )
} 