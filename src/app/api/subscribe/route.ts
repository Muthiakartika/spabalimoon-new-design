import { NextResponse } from "next/server";

/**
 * Newsletter sign-up.
 *
 * Same contract as the live endpoint: POST {email} -> {success, message},
 * anything else -> 405 {success:false, message:"Method Not Allowed"}.
 *
 * TODO: this does not store anything yet. Point it at whatever the live site
 * writes to (or a mailing-list provider) before going live, otherwise people
 * will be told they subscribed when nothing was recorded.
 */
export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { success: false, message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  console.warn(`[subscribe] ${email} — not stored yet, see src/app/api/subscribe/route.ts`);

  return NextResponse.json({ success: true, message: "Thanks for subscribing!" });
}

export async function GET() {
  return NextResponse.json({ success: false, message: "Method Not Allowed" }, { status: 405 });
}
