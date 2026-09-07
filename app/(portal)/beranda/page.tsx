"use client";

import { useEffect, useState } from "react";
import AttendanceSummaryCard from "./components/AttendanceSummaryCard";

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
    <div className="flex flex-col gap-5">
      {/* Greeting */}
      <div>
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">Beranda</p>
        <h1 className="text-white font-bold text-2xl leading-tight">
          Halo,{" "}
          <span className="text-blue-400">{name || "Anggota"}</span>
        </h1>
      </div>

      {/* Attendance Summary Card */}
      <AttendanceSummaryCard />
    </div>
  );
}
