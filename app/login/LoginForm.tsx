"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    name: "",
    nisn: "",
  });
  const [showNisn, setShowNisn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Pastikan background halaman penuh gelap saat berada di halaman login
  useEffect(() => {
    document.documentElement.classList.add("dark");
    const prevBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#101320";

    return () => {
      document.body.style.backgroundColor = prevBg;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login gagal");
      }

      setSuccess("Login berhasil! Mengalihkan...");

      // Simpan data user ke sessionStorage
      sessionStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        router.push("/beranda");
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat login");
      }
    } finally {
      setLoading(false);
    }
  };

  const message = `Halo,

Saya mengalami kendala saat mencoba login ke portal admaja. Apakah bisa dibantu untuk mengecek dan mengatasi kendala tersebut?

Terima kasih atas bantuannya.`;

  const whatsappUrl = `https://wa.me/6289531310903?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center bg-main text-white px-5 py-12 sm:px-8 lg:px-12 overflow-hidden [color-scheme:dark]">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#1E3E62]/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#1E3E62]/20 blur-[120px]" />

      <div className="relative w-full max-w-md">
        {/* Card Box */}
        <div className="rounded-2xl border border-white/10 bg-sec/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-9">
          {/* Header Branding */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/logo-v2.png"
                alt="Logo Admaja"
                width={36}
                height={36}
                className="w-9 h-auto object-contain"
                priority
              />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white leading-tight">
                  Portal
                </span>
                <span className="font-bold text-sm text-red-500">Admaja</span>
              </div>
            </div>

            <p className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
              PORTAL ADMAJA
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Selamat datang
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Silakan login untuk masuk ke portal{" "}
              <span className="font-bold text-red-500">Admaja</span>.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-rose-300"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div
              role="status"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-300"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              {/* Nama Lengkap Input */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Nama Lengkap
                </label>
                <div className="relative flex items-center rounded-xl border border-white/10 bg-[#0B1426] transition-colors focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/15">
                  <User
                    aria-hidden="true"
                    className="absolute left-3.5 h-5 w-5 text-slate-400"
                  />
                  <input
                    className="w-full rounded-xl bg-transparent py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                    placeholder="Masukkan Nama Lengkap"
                    required
                    autoComplete="name"
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* NISN Input */}
              <div>
                <label
                  htmlFor="nisn"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  NISN
                </label>
                <div className="relative flex items-center rounded-xl border border-white/10 bg-[#0B1426] transition-colors focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/15">
                  <Lock
                    aria-hidden="true"
                    className="absolute left-3.5 h-5 w-5 text-slate-400"
                  />
                  <input
                    placeholder="Masukkan NISN 10 Digit"
                    className="w-full rounded-xl bg-transparent py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                    required
                    type={showNisn ? "text" : "password"}
                    name="nisn"
                    id="nisn"
                    value={formData.nisn}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNisn((prev) => !prev)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
                    aria-label={showNisn ? "Sembunyikan NISN" : "Tampilkan NISN"}
                  >
                    {showNisn ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1E3E62] hover:bg-[#254d79] active:bg-[#183350] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1E3E62]/30 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              type="submit"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Portal</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Belum memiliki akun?{" "}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline transition-colors"
          >
            Hubungi admin.
          </a>
        </p>
      </div>
    </section>
  );
}
