"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AttendanceSummary {
  total: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
}

// ─── Stat Item Config ─────────────────────────────────────────────────────────
const STATS = [
  {
    key: "hadir" as const,
    label: "Hadir",
    filter: "Hadir",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    ring: "hover:ring-emerald-500/30",
    bar: "bg-emerald-500",
  },
  {
    key: "izin" as const,
    label: "Izin",
    filter: "Izin",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    ring: "hover:ring-amber-500/30",
    bar: "bg-amber-500",
  },
  {
    key: "sakit" as const,
    label: "Sakit",
    filter: "Sakit",
    icon: AlertCircle,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    ring: "hover:ring-sky-500/30",
    bar: "bg-sky-500",
  },
  {
    key: "alpha" as const,
    label: "Alpha",
    filter: "Alpha",
    icon: XCircle,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    ring: "hover:ring-rose-500/30",
    bar: "bg-rose-500",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AttendanceSummaryCard() {
  const router = useRouter();
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/attendance-history?limit=1&page=1");
        const json = await res.json();
        if (res.ok && json.summary) {
          setSummary(json.summary);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const hadirPct =
    summary && summary.total > 0
      ? Math.round((summary.hadir / summary.total) * 100)
      : 0;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 rounded bg-white/10" />
          <div className="h-3 w-32 rounded-full bg-white/10" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10 mb-4" />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl bg-white/5 border border-white/10 h-20" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error / no data state ─────────────────────────────────────────────────
  if (error || !summary) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
        <AlertCircle className="w-4 h-4 text-white/30 shrink-0" />
        <p className="text-white/40 text-xs">Gagal memuat ringkasan kehadiran.</p>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (summary.total === 0) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
        <CalendarCheck className="w-4 h-4 text-white/30 shrink-0" />
        <p className="text-white/40 text-xs">Belum ada catatan kehadiran.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">
            Rekap Kehadiran
          </span>
        </div>
        <button
          onClick={() => router.push("/attendance_history")}
          className="text-blue-400 text-xs font-semibold hover:text-blue-300 transition-colors cursor-pointer"
        >
          Lihat Semua →
        </button>
      </div>

      {/* Persentase & progress bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-white font-bold text-2xl">{hadirPct}%</span>
            <span className="text-white/40 text-xs ml-1.5">tingkat kehadiran</span>
          </div>
          <span className="text-white/40 text-xs">{summary.total} sesi</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${hadirPct}%` }}
          />
        </div>
      </div>

      {/* Stat cards — klik navigasi ke halaman riwayat dengan filter */}
      <div className="grid grid-cols-4 gap-2">
        {STATS.map(({ key, label, filter, icon: Icon, color, bg, border, ring }) => {
          const count = summary[key];
          const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
          return (
            <div
              key={key}
              className={`group flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border
                transition-all cursor-pointer hover:ring-1 active:scale-[0.96]
                ${bg} ${border} ${ring}`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
              <span className={`font-bold text-xl leading-none ${color}`}>{count}</span>
              <span className="text-white/50 text-[10px] font-medium leading-none">{label}</span>
              <span className="text-white/25 text-[9px]">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
