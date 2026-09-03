import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { withCors, handleOptions } from "@/lib/cors";
import { jwtVerify } from "jose";

interface VoteRequestBody {
  elections_id: string;
  candidates_id: string;
  voter_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return withCors(
        NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
        req,
      );
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "default_secret",
    );
    const { payload } = await jwtVerify(token, secret);

    if (!payload || !payload.user_id) {
      return withCors(
        NextResponse.json({ message: "Invalid user session" }, { status: 401 }),
        req,
      );
    }

    const body: VoteRequestBody = await req.json();
    const { elections_id, candidates_id, voter_id } = body;

    // 1. Validasi field wajib
    if (!elections_id || !candidates_id || !voter_id) {
      return withCors(
        NextResponse.json(
          { error: "elections_id, candidates_id, dan voter_id wajib diisi" },
          { status: 400 },
        ),
        req,
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE);

    // Query helper untuk ID custom atau MongoDB ObjectId
    const electionQuery = ObjectId.isValid(elections_id)
      ? { $or: [{ _id: new ObjectId(elections_id) }, { elections_id }] }
      : { elections_id };

    // 2. Validasi periode pemilihan ada & berstatus dibuka
    const election = await db.collection("elections").findOne(electionQuery);

    if (!election) {
      return withCors(
        NextResponse.json(
          { error: "Periode pemilihan tidak ditemukan" },
          { status: 404 },
        ),
        req,
      );
    }

    if (election.status !== "dibuka") {
      return withCors(
        NextResponse.json(
          { error: "Periode pemilihan belum dibuka atau sudah ditutup" },
          { status: 403 },
        ),
        req,
      );
    }

    // Query helper untuk candidate
    const candidateQuery = ObjectId.isValid(candidates_id)
      ? {
          $or: [{ _id: new ObjectId(candidates_id) }, { candidates_id }],
          elections_id: election.elections_id || elections_id,
        }
      : {
          candidates_id,
          elections_id: election.elections_id || elections_id,
        };

    // 3. Validasi kandidat ada & terdaftar di election ini
    const candidate = await db.collection("candidates").findOne(candidateQuery);

    if (!candidate) {
      return withCors(
        NextResponse.json(
          { error: "Kandidat tidak ditemukan pada periode pemilihan ini" },
          { status: 404 },
        ),
        req,
      );
    }

    // Query helper untuk voter
    const voterQuery = ObjectId.isValid(voter_id)
      ? { $or: [{ _id: new ObjectId(voter_id) }, { user_id: voter_id }] }
      : { user_id: voter_id };

    // 4. Validasi voter ada & berstatus aktif
    const voter = await db.collection("user_member").findOne(voterQuery);

    if (!voter) {
      return withCors(
        NextResponse.json(
          { error: "Anggota (voter) tidak ditemukan" },
          { status: 404 },
        ),
        req,
      );
    }

    if (voter.status !== "aktif") {
      return withCors(
        NextResponse.json(
          { error: "Hanya anggota aktif yang berhak memilih" },
          { status: 403 },
        ),
        req,
      );
    }

    const resolvedElectionId = election.elections_id || elections_id;
    const resolvedCandidateId = candidate.candidates_id || candidates_id;
    const resolvedVoterId = voter.user_id || voter_id;

    // 5. Validasi belum pernah vote di periode ini
    const existingVote = await db.collection("votes").findOne({
      elections_id: resolvedElectionId,
      voter_id: resolvedVoterId,
    });

    if (existingVote) {
      return withCors(
        NextResponse.json(
          { error: "Anda sudah memilih pada periode pemilihan ini" },
          { status: 409 },
        ),
        req,
      );
    }

    // 6. Simpan suara
    try {
      const uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const id_vote = `VOTE-${uniqueId}`;

      const result = await db.collection("votes").insertOne({
        id_vote: id_vote,
        elections_id: resolvedElectionId,
        candidates_id: resolvedCandidateId,
        voter_id: resolvedVoterId,
        waktu_vote: new Date(),
      });

      return withCors(
        NextResponse.json(
          {
            success: true,
            message: "Suara berhasil disimpan",
            data: {
              id_vote,
              elections_id: resolvedElectionId,
              candidates_id: resolvedCandidateId,
              voter_id: resolvedVoterId,
            },
          },
          { status: 201 },
        ),
        req,
      );
    } catch (err: unknown) {
      // Lapisan pengaman terakhir race condition (duplicate key error)
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        err.code === 11000
      ) {
        return withCors(
          NextResponse.json(
            { error: "Anda sudah memilih pada periode pemilihan ini" },
            { status: 409 },
          ),
          req,
        );
      }
      throw err;
    }
  } catch (error) {
    console.error("Error saat submit vote:", error);
    return withCors(
      NextResponse.json(
        { error: "Terjadi kesalahan pada server" },
        { status: 500 },
      ),
      req,
    );
  }
}

export const OPTIONS = handleOptions;
