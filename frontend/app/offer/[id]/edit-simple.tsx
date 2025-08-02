"use client";
import { useParams } from "next/navigation";

export default function EditOfferSimplePage() {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="container mx-auto px-4 py-10 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Edit Offer {id}</h1>
        <p>This is a simple edit page for offer {id}</p>
      </div>
    </div>
  );
} 