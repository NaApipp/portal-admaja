"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Vote,
  User,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Star,
} from "lucide-react";

interface Candidate {
  _id: string;
  candidates_id: string;
  elections_id: string;
  serial_number: number;
  candidate_data: {
    name: string;
    foto_url?: string;
    kelas?: string;
    angkatan?: string;
    bio?: string;
  };
  visi_misi: {
    visi: string;
    misi: string[];
  };
}

interface Election {
  _id: string;
  elections_id: string;
  name: string;
  status: "draft" | "dibuka" | "ditutup";
}

type Step = "list" | "detail" | "confirm" | "success" | "already-voted";

export default function ElectionsPage() {
  const [step, setStep] = useState<Step>("list");
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setUserId(u.user_id || u._id || "");
        setUserName(u.name || "");
      }
    } catch {}
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [electRes, candRes] = await Promise.all([
          fetch("/api/elections"),
          fetch("/api/candidates"),
        ]);
        if (!electRes.ok || !candRes.ok) { setError("Gagal memuat data."); return; }
        const electJson = await electRes.json();
        const candJson = await candRes.json();
        const allElections: Election[] = electJson.data || [];
        const allCandidates: Candidate[] = candJson.data || [];
        const active = allElections.find((e) => e.status === "dibuka") ?? null;
        setElection(active);
        if (active) {
          const filtered = allCandidates
            .filter((c) => c.elections_id === (active.elections_id || active._id))
            .sort((a, b) => a.serial_number - b.serial_number);
          setCandidates(filtered);
        }
      } catch {
        setError("Terjadi kesalahan koneksi.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVote = async () => {
    if (!selected || !election || !userId || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elections_id: election.elections_id || election._id,
          candidates_id: selected.candidates_id || selected._id,
          voter_id: userId,
        }),
      });
      const json = await res.json();
      if (res.status === 409) { setStep("already-voted"); return; }
      if (!res.ok) { setError(json.error || json.message || "Gagal menyimpan suara."); return; }
      setStep("success");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
        <p className="text-white/60 text-sm">Memuat data pemilihan...</p>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
          <Vote className="w-8 h-8 text-white/30" />
        </div>
        <h2 className="text-white font-bold text-lg">Belum Ada Pemilihan</h2>
        <p className="text-white/50 text-sm leading-relaxed">Saat ini tidak ada periode pemilihan yang sedang berlangsung.</p>
      </div>
    );
  }

  if (step === "already-voted") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-amber-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-xl mb-2">Sudah Memilih</h2>
          <p className="text-white/60 text-sm leading-relaxed">Kamu sudah memberikan suaramu. Setiap anggota hanya dapat memilih satu kali.</p>
        </div>
        <div className="w-full p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-amber-300 text-sm font-medium">{election.name}</p>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-xl mb-2">Suara Terkirim!</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Terima kasih, <span className="text-white font-semibold">{userName}</span>! Suaramu untuk{" "}
            <span className="text-emerald-400 font-semibold">{selected?.candidate_data.name}</span> telah berhasil disimpan.
          </p>
        </div>
        <div className="w-full p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-emerald-300 text-xs font-medium">PEMILIHAN</p>
          <p className="text-white text-sm font-semibold mt-1">{election.name}</p>
        </div>
      </div>
    );
  }

  if (step === "list") {
    return (
      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 text-xs font-semibold uppercase tracking-widest">Pilih Komsat</span>
          </div>
          <h1 className="text-white font-bold text-xl leading-tight">{election.name}</h1>
          <p className="text-white/50 text-xs">Ketuk kandidat untuk melihat profil lengkap.</p>
        </div>
        {error && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {candidates.length === 0 ? (
            <div className="text-center py-10 text-white/40 text-sm">Belum ada kandidat terdaftar.</div>
          ) : (
            candidates.map((c) => (
              <button
                key={c._id}
                onClick={() => { setSelected(c); setStep("detail"); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 active:scale-[0.98] transition-all text-left cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <span className="text-blue-300 font-bold text-lg">{c.serial_number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{c.candidate_data.name}</p>
                  {(c.candidate_data.kelas || c.candidate_data.angkatan) && (
                    <p className="text-white/50 text-xs mt-0.5">{[c.candidate_data.kelas, c.candidate_data.angkatan].filter(Boolean).join(" \u00b7 ")}</p>
                  )}
                  <p className="text-white/40 text-xs mt-1 line-clamp-1">{c.visi_misi.visi}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  if (step === "detail" && selected) {
    return (
      <div className="flex flex-col gap-5 p-5">
        <button onClick={() => setStep("list")} className="flex items-center gap-2 text-white/60 hover:text-white text-sm w-fit cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
        </button>
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-48 h-auto bg-blue-600/20 border-2 border-blue-500/40 flex items-center justify-center overflow-hidden">
            {selected.candidate_data.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.candidate_data.foto_url} alt={selected.candidate_data.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-9 h-9 text-blue-300" />
            )}
          </div>
          <div className="text-center">
            <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/25 mb-2">
              <span className="text-blue-300 text-xs font-semibold">No. Urut {selected.serial_number}</span>
            </div>
            <h2 className="text-white font-bold text-lg">{selected.candidate_data.name}</h2>
            {(selected.candidate_data.kelas || selected.candidate_data.angkatan) && (
              <p className="text-white/50 text-sm mt-0.5">{[selected.candidate_data.kelas, selected.candidate_data.angkatan].filter(Boolean).join(" \u00b7 ")}</p>
            )}
          </div>
        </div>
        {selected.candidate_data.bio && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Tentang</p>
            <p className="text-white/80 text-sm leading-relaxed">{selected.candidate_data.bio}</p>
          </div>
        )}
        <div className="p-4 rounded-2xl bg-blue-500/8 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-blue-400" />
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Visi</p>
          </div>
          <p className="text-white/85 text-sm leading-relaxed">{selected.visi_misi.visi}</p>
        </div>
        {selected.visi_misi.misi.length > 0 && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Misi</p>
            <ol className="flex flex-col gap-2.5">
              {selected.visi_misi.misi.map((m, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-white/75 text-sm leading-relaxed">{m}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        <button
          onClick={() => setStep("confirm")}
          className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <Vote className="w-4 h-4" /> Pilih Kandidat Ini
        </button>
      </div>
    );
  }

  if (step === "confirm" && selected) {
    return (
      <div className="flex flex-col gap-5 p-5">
        <button onClick={() => setStep("detail")} className="flex items-center gap-2 text-white/60 hover:text-white text-sm w-fit cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Profil
        </button>
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
            <Vote className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">Konfirmasi Pilihanmu</h2>
            <p className="text-white/50 text-sm mt-1">Suara tidak dapat diubah setelah dikirim.</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white/5 border border-white/15 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <span className="text-blue-300 font-bold text-lg">{selected.serial_number}</span>
            </div>
            <div>
              <p className="text-white font-bold">{selected.candidate_data.name}</p>
              {(selected.candidate_data.kelas || selected.candidate_data.angkatan) && (
                <p className="text-white/50 text-xs">{[selected.candidate_data.kelas, selected.candidate_data.angkatan].filter(Boolean).join(" \u00b7 ")}</p>
              )}
            </div>
          </div>
          <div className="border-t border-white/10 pt-3">
            <p className="text-white/40 text-xs">Pemilihan</p>
            <p className="text-white/80 text-sm font-medium mt-0.5">{election.name}</p>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={handleVote}
            disabled={submitting}
            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Mengirim Suara...</>) : (<><CheckCircle2 className="w-4 h-4" />Ya, Kirim Suaraku</>)}
          </button>
          <button onClick={() => setStep("list")} disabled={submitting} className="w-full h-11 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-sm transition-all cursor-pointer disabled:opacity-50">
            Batal, Pilih Lagi
          </button>
        </div>
      </div>
    );
  }

  return null;
}
