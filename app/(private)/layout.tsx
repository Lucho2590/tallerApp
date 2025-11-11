"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Sidebar } from "@/components/layout/sidebar";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
