import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const report = await request.json();
    console.warn("[CSP REPORT-ONLY VIOLATION]:", JSON.stringify(report, null, 2));
    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "invalid_report" }, { status: 400 });
  }
}
