"use client";
import { SimpleNavigation } from "@/components/simple-navigation";
import { useSession, signOut } from "next-auth/react";

export default function ClientNavigation() {
  const { data: session } = useSession();
  return (
    <SimpleNavigation
      user={session?.user ? { name: session.user.name ?? '', avatar: session.user.image ?? undefined } : undefined}
      onLogout={() => signOut()}
    />
  );
} 