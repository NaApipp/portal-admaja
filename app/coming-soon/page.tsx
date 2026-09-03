"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, CalendarCheck, Clock, ShieldCheck } from "lucide-react";
import Footer from "@/components/Footer";

export default function ComingSoonPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-main text-white flex flex-col justify-between">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md mx-auto flex flex-col items-center text-center">
          {/* Logo & Status Badge */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-blue-500/20 blur-lg animate-pulse" />
              <Image
                src="/logo-v2.png"
                alt="Logo Admaja"
                width={72}
                height={72}
                className="relative w-18 h-auto object-contain drop-shadow-md"
                priority
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-xs font-semibold text-blue-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-4" />
              Sedang Dalam Pengembangan
            </div>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
            Fitur Segera Hadir
          </h1>
          <p className="text-sm text-blue-100/70 leading-relaxed max-w-sm mb-6">
            Modul ini sedang disiapkan oleh tim Admaja untuk mempermudah pemantauan aktivitas dan catatan kehadiran anggota.
          </p>

          {/* Feature Highlights Preview */}
          <div className="w-full bg-sec/60 border border-white/10 rounded-2xl p-4 mb-6 text-left space-y-3 shadow-xl backdrop-blur-sm">
            <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Yang Akan Datang
            </p>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 shrink-0 mt-0.5">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Riwayat Absensi Lengkap</p>
                <p className="text-xs text-white/50">Cek rekap kehadiran setiap sesi latihan dan agenda organisasi.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2.5">
            <Link
              href="/beranda"
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-white text-[#1e3388] font-bold text-sm hover:bg-white/90 active:scale-[0.98] transition-all shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>

            <button
              onClick={() => router.back()}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-white/70 font-semibold text-sm hover:bg-white/10 hover:text-white active:scale-[0.98] transition-all cursor-pointer"
            >
              Halaman Sebelumnya
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}