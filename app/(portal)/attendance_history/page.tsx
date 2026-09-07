"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
  Filter,
  ChevronDown,
  Calendar,
  BookOpen,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type StatusPresensi = "Hadir" | "Izin" | "Sakit" | "Alpha";

interface SessionInfo {
  nama_kegiatan: string;
  desc_kegiatan: string;
  date: string | null;
}

interface AttendanceRecord {
  presences_id: string;
  session_id: string;
  user_id: string;
  status: StatusPresensi;
  keterangan: string;
  updated_at: string;
  session: SessionInfo | null;
}

interface Summary {
  total: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  StatusPresensi,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
  }
> = {
  Hadir: {
    label: "Hadir",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  Izin: {
    label: "Izin",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  Sakit: {
    label: "Sakit",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/25",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  Alpha: {
    label: "Alpha",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/25",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function StatusBadge({ status }: { status: StatusPresensi }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Alpha;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color} ${cfg.bg} ${cfg.border}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({
  summary,
  activeFilter,
  onFilter,
}: {
  summary: Summary;
  activeFilter: string;
  onFilter: (status: string) => void;
}) {
  const hadirPct =
    summary.total > 0 ? Math.round((summary.hadir / summary.total) * 100) : 0;

  const items = [
    {
      key: "Hadir",
      label: "Hadir",
      value: summary.hadir,
      color: "text-emerald-400",
      ring: "ring-emerald-500/40",
    },
    {
      key: "Izin",
      label: "Izin",
      value: summary.izin,
      color: "text-amber-400",
      ring: "ring-amber-500/40",
    },
    {
      key: "Sakit",
      label: "Sakit",
      value: summary.sakit,
      color: "text-sky-400",
      ring: "ring-sky-500/40",
    },
    {
      key: "Alpha",
      label: "Alpha",
      value: summary.alpha,
      color: "text-rose-400",
      ring: "ring-rose-500/40",
    },
  ];

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col gap-4">
      {/* Persentase kehadiran */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider">
            Total Kehadiran
          </p>
          <p className="text-white font-bold text-2xl mt-0.5">
            {hadirPct}%
            <span className="text-white/40 text-sm font-normal ml-1.5">
              dari {summary.total} sesi
            </span>
          </p>
        </div>
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <CalendarCheck className="w-6 h-6 text-blue-400" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${hadirPct}%` }}
        />
      </div>

      {/* Stats grid — klik untuk filter */}
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const isActive = activeFilter === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onFilter(isActive ? "" : item.key)}
              className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border transition-all cursor-pointer
                ${
                  isActive
                    ? `bg-white/10 border-white/25 ring-1 ${item.ring}`
                    : "bg-white/5 border-white/10 hover:bg-white/8"
                }`}
            >
              <span className={`font-bold text-lg leading-none ${item.color}`}>
                {item.value}
              </span>
              <span className="text-white/50 text-[10px] font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-3 w-20 bg-white/10 rounded-full mb-2" />
          <div className="h-4 w-40 bg-white/10 rounded-full" />
        </div>
        <div className="h-6 w-16 bg-white/10 rounded-full" />
      </div>
      <div className="h-3 w-full bg-white/5 rounded-full" />
    </div>
  );
}

import { useSearchParams } from "next/navigation";

// ─── Main Page Content Component ──────────────────────────────────────────────
export default function AttendanceHistoryPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "";

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchData = useCallback(
    async (currentPage: number, filter: string, replace: boolean) => {
      if (replace) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: "15",
        });
        if (filter) params.set("status", filter);

        const res = await fetch(`/api/attendance-history?${params.toString()}`);
        const json = await res.json();

        if (!res.ok) {
          setError(json.message || "Gagal memuat data.");
          return;
        }

        if (replace) {
          setRecords(json.data || []);
        } else {
          setRecords((prev) => [...prev, ...(json.data || [])]);
        }

        if (json.summary) setSummary(json.summary);
        if (json.pagination) setPagination(json.pagination);
      } catch {
        setError("Terjadi kesalahan koneksi. Periksa jaringan kamu.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  // Initial load & filter change
  useEffect(() => {
    setPage(1);
    fetchData(1, statusFilter, true);
  }, [statusFilter, fetchData]);

  const handleLoadMore = () => {
    if (!pagination || page >= pagination.totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage, statusFilter, false);
  };

  const handleFilterSelect = (status: string) => {
    setStatusFilter(status);
    setFilterOpen(false);
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {/* Header skeleton */}
        <div>
          <div className="h-3 w-28 bg-white/10 rounded-full mb-2 animate-pulse" />
          <div className="h-6 w-48 bg-white/10 rounded-full animate-pulse" />
        </div>
        {/* Summary skeleton */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 h-40 animate-pulse" />
        {/* Cards skeleton */}
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error && records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Gagal Memuat Data</h2>
          <p className="text-white/50 text-sm mt-1 leading-relaxed">{error}</p>
        </div>
        <button
          onClick={() => fetchData(1, statusFilter, true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all cursor-pointer active:scale-[0.97]"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-400 text-xs font-semibold uppercase tracking-widest">
              Riwayat Kehadiran
            </span>
          </div>
        </div>

        {/* Filter button */}
        <div className="relative">
          {filterOpen && (
            <div className="absolute right-0 top-full mt-1.5 z-20 w-36 rounded-xl bg-[#0d1f3c] border border-white/15 shadow-2xl overflow-hidden">
              {[
                { key: "", label: "Semua" },
                { key: "Hadir", label: "Hadir" },
                { key: "Izin", label: "Izin" },
                { key: "Sakit", label: "Sakit" },
                { key: "Alpha", label: "Alpha" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleFilterSelect(opt.key)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors cursor-pointer text-left
                    ${
                      statusFilter === opt.key
                        ? "bg-blue-600/30 text-blue-300 font-semibold"
                        : "text-white/70 hover:bg-white/8 font-medium"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Card ────────────────────────────────────────────────────── */}
      {summary && (
        <SummaryCard
          summary={summary}
          activeFilter={statusFilter}
          onFilter={handleFilterSelect}
        />
      )}

      {/* ── Active Filter Label ──────────────────────────────────────────────── */}
      {statusFilter && (
        <div className="flex items-center justify-between">
          <p className="text-white/50 text-xs">
            Menampilkan:{" "}
            <span className="text-white font-semibold">{statusFilter}</span>
            {pagination && <> · {pagination.total} data</>}
          </p>
          <button
            onClick={() => setStatusFilter("")}
            className="text-blue-400 text-xs font-semibold hover:text-blue-300 cursor-pointer"
          >
            Hapus Filter
          </button>
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────────── */}
      {records.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-white/25" />
          </div>
          <div>
            <p className="text-white font-semibold text-base">Belum Ada Data</p>
            <p className="text-white/40 text-sm mt-1">
              {statusFilter
                ? `Tidak ada catatan dengan status "${statusFilter}".`
                : "Riwayat kehadiran kamu akan muncul di sini."}
            </p>
          </div>
        </div>
      )}

      {/* ── Records List ─────────────────────────────────────────────────────── */}
      {records.length > 0 && (
        <div className="flex flex-col gap-3">
          {records.map((record) => {
            const cfg = STATUS_CONFIG[record.status] ?? STATUS_CONFIG.Alpha;
            return (
              <div
                key={record.presences_id}
                className={`rounded-2xl border p-4 flex flex-col gap-2.5 transition-all ${cfg.bg} ${cfg.border}`}
              >
                {/* Row: Tanggal & Status */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    <span className="text-white/60 text-xs font-medium truncate">
                      {formatDate(record.session?.date ?? record.updated_at)}
                    </span>
                  </div>
                  <StatusBadge status={record.status} />
                </div>

                {/* Nama kegiatan */}
                <div>
                  <p className="text-white font-semibold text-sm leading-snug">
                    {record.session?.nama_kegiatan ||
                      "Kegiatan tidak diketahui"}
                  </p>
                  {record.session?.desc_kegiatan && (
                    <p className="text-white/45 text-xs mt-0.5 line-clamp-1">
                      {record.session.desc_kegiatan}
                    </p>
                  )}
                </div>

                {/* Keterangan (hanya tampil jika ada) */}
                {record.keterangan && (
                  <div className="flex items-start gap-2 pt-1 border-t border-white/10">
                    <BookOpen className="w-3 h-3 text-white/30 shrink-0 mt-0.5" />
                    <p className="text-white/50 text-xs italic leading-relaxed">
                      {record.keterangan}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Error (inline, saat ada data) ─────────────────────────────────── */}
      {error && records.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <p className="text-rose-400 text-sm">{error}</p>
        </div>
      )}

      {/* ── Load More ─────────────────────────────────────────────────────── */}
      {pagination && page < pagination.totalPages && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="w-full h-11 mt-1 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 font-semibold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loadingMore ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Memuat...
            </>
          ) : (
            <>
              Muat Lebih Banyak
              <span className="text-white/40 text-xs font-normal">
                ({records.length} / {pagination.total})
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
