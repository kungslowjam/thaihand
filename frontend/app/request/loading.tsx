import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>กำลังโหลด...</span>
      </div>
    </div>
  );
} 