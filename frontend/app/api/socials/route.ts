import { NextResponse } from "next/server";

const SOCIALS_API = process.env.SOCIALS_API ?? "https://api.memshaheb.com/site/socials";

export async function GET() {
  try {
    const r = await fetch(SOCIALS_API, { cache: "no-store" });
    if (!r.ok) return NextResponse.json([], { status: 200 });
    const data = await r.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
