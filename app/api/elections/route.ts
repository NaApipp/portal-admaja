import { withCors, handleOptions } from "@/lib/cors";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
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

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE);
    const electionCollection = db.collection("elections");

    const elections = await electionCollection.find({}).toArray();

    return withCors(
      NextResponse.json(
        {
          success: true,
          message: "Data Election berhasil diambil",
          data: elections,
        },
        { status: 200 },
      ),
      req,
    );
  } catch (error) {
    console.error("Error processing elections:", error);
    return withCors(
      NextResponse.json(
        {
          success: false,
          message: "Terjadi kesalahan saat memproses elections",
        },
        { status: 500 },
      ),
      req,
    );
  }
}
export const OPTIONS = handleOptions;