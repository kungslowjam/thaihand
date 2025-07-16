import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmModal({ open, title, description, onConfirm, onCancel, loading }: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xs w-full text-center border-t-4 border-red-200 animate-fade-in">
        <X className="h-10 w-10 text-red-300 mx-auto mb-2 animate-bounce" />
        <div className="text-lg font-semibold mb-2">{title}</div>
        {description && <div className="text-gray-400 mb-4 text-sm">{description}</div>}
        <div className="flex gap-2 justify-center mt-4">
          <Button variant="destructive" onClick={onConfirm} disabled={loading} className="px-6">
            {loading && <span className="animate-spin mr-2">⏳</span>} ยืนยัน
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={loading} className="px-6">ยกเลิก</Button>
        </div>
      </div>
    </div>
  );
} 