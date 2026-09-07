import { withCors, handleOptions } from "@/lib/cors";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { jwtVerify } from "jose";

/**
 * GET /api/attendance-history
 * Mengambil riwayat kehadiran milik user yang sedang login.
 * Token diambil dari HTTP-only cookie "token".
 * 
 * Query params (opsional):
 *  - ?page=1        -> Halaman (default: 1)
 *  - ?limit=20      -> Jumlah data per halaman (default: 20, max: 100)
 *  - ?status=Hadir  -> Filter berdasarkan status presensi
 */
export async function GET(req: NextRequest) {
  // 1. Ambil & verifikasi JWT dari cookie
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return withCors(
      NextResponse.json(
        { success: false, message: "Unauthorized: Silakan login terlebih dahulu." },
        { status: 401 }
      ),
      req
    );
  }

  let userId: string;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
    const { payload } = await jwtVerify(token, secret);
    userId = payload.user_id as string;
    if (!userId) throw new Error("user_id tidak ditemukan di token");
  } catch {
    return withCors(
      NextResponse.json(
        { success: false, message: "Token tidak valid atau sudah kadaluarsa. Silakan login ulang." },
        { status: 401 }
      ),
      req
    );
  }

  // 2. Parsing query params
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const statusFilter = searchParams.get("status");
  const skip = (page - 1) * limit;

  // 3. Query ke database
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE);
    const presencesCollection = db.collection("presences");
    const sessionsCollection = db.collection("sessions");

    // Build filter
    const filter: Record<string, unknown> = { user_id: userId };
    if (statusFilter && ["Hadir", "Izin", "Sakit", "Alpha"].includes(statusFilter)) {
      filter.status = statusFilter;
    }

    // Ambil total dokumen & data presensi dengan pagination
    const [total, presences] = await Promise.all([
      presencesCollection.countDocuments(filter),
      presencesCollection
        .find(filter)
        .sort({ updated_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    if (presences.length === 0) {
      return withCors(
        NextResponse.json({
          success: true,
          message: "Belum ada riwayat kehadiran.",
          data: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        }),
        req
      );
    }

    // Ambil data sesi yang terkait
    const sessionIds = [...new Set(presences.map((p) => p.session_id))];
    const sessions = await sessionsCollection
      .find({ session_id: { $in: sessionIds } })
      .toArray();

    const sessionMap = new Map(sessions.map((s) => [s.session_id, s]));

    // Gabungkan data presences dengan data sesi
    const data = presences.map((p) => {
      const session = sessionMap.get(p.session_id);
      return {
        presences_id: p.presences_id || p._id?.toString(),
        session_id: p.session_id,
        user_id: p.user_id,
        status: p.status,
        keterangan: p.keterangan || "",
        updated_at: p.updated_at,
        // Data sesi
        session: session
          ? {
              nama_kegiatan: session.nama_kegiatan || "",
              desc_kegiatan: session.desc_kegiatan || "",
              date: session.date || null,
            }
          : null,
      };
    });

    // Hitung statistik ringkasan
    const allPresences = await presencesCollection.find({ user_id: userId }).toArray();
    const summary = {
      total: allPresences.length,
      hadir: allPresences.filter((p) => p.status === "Hadir").length,
      izin: allPresences.filter((p) => p.status === "Izin").length,
      sakit: allPresences.filter((p) => p.status === "Sakit").length,
      alpha: allPresences.filter((p) => p.status === "Alpha").length,
    };

    return withCors(
      NextResponse.json({
        success: true,
        message: "Riwayat kehadiran berhasil diambil.",
        data,
        summary,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }),
      req
    );
  } catch (error) {
    console.error("Attendance history error:", error);
    return withCors(
      NextResponse.json(
        { success: false, message: "Terjadi kesalahan server. Coba lagi nanti." },
        { status: 500 }
      ),
      req
    );
  }
}

export const OPTIONS = handleOptions;
