"use client";

import { useEffect, useState } from "react";

export default function BerandaPage() {
  const [name, setName] = useState<string>("");

  useEffect(() => {
    try {
      const sessionUser = sessionStorage.getItem("user");
      if (sessionUser) {
        const user = JSON.parse(sessionUser);
        setName(user.name || "");
      }
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
    }
  }, []);
  return (
    <div className="flex flex-col h-screen">
      <h1 className="text-2xl font-bold text-white">Beranda</h1>

      <h2 className="font-bold text-2xl text-white mt-5">
        Halo, <span className="text-2xl font-bold text-red-600">{name}</span>
      </h2>
    </div>
  );
}
