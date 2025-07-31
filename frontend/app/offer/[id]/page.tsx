'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OfferPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to edit page
    router.replace(`/offer/${params.id}/edit`);
  }, [params.id, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังเปลี่ยนเส้นทาง...</p>
      </div>
    </div>
  );
} 