"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Import Componets Navbar
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (!user) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return null; // loading spinner
  }

  return (
    <body className="min-h-screen bg-gray-900 flex justify-center">
      <div className="relative w-full max-w-[430px] min-h-screen flex flex-col bg-main shadow-2xl overflow-hidden">
        <Navbar />
        <main className="flex-1 flex flex-col pt-22 p-6 overflow-y-auto">
          {children}
          <Footer />
        </main>
      </div>
    </body>
  );
}