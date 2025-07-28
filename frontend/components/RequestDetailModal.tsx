import { Button } from "@/components/ui/button";
import React from "react";

interface RequestDetailModalProps {
  open: boolean;
  onClose: () => void;
  request: {
    id: number;
    user?: string;
    product: string;
    status: string;
    weight: string;
    note: string;
    createdAt: string;
  } | null;
}

export default function RequestDetailModal({ open, onClose, request }: RequestDetailModalProps) {
  if (!open || !request) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xs w-full text-center animate-fade-in">
        <div className="text-lg font-bold mb-4">รายละเอียดคำขอฝากหิ้ว</div>
        <div className="mb-2"><b>สินค้า:</b> {request.product}</div>
        {request.user && <div className="mb-2"><b>ผู้ฝาก:</b> {request.user}</div>}
        <div className="mb-2"><b>น้ำหนัก:</b> {request.weight}</div>
        <div className="mb-2"><b>หมายเหตุ:</b> {request.note}</div>
        <div className="mb-2"><b>สถานะ:</b> {request.status}</div>
        <div className="mb-2"><b>วันที่:</b> {request.createdAt}</div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>ปิด</Button>
        </div>
      </div>
    </div>
  );
} 