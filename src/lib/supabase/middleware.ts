// AUTH BYPASSED: All routes pass through without authentication checks.
// To re-enable auth, restore the original updateSession implementation.
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request });
}
