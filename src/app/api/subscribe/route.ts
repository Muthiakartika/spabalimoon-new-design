import { NextResponse } from "next/server";

/**
 * Newsletter sign-up — the live endpoint (pages/api/subscribe.js of the old
 * project), same contract: POST {email} -> {success, message}, anything else
 * -> 405 {success:false, message:"Method Not Allowed"}.
 *
 * 1. The address goes to the owner's Google Sheet through its Apps Script web
 *    app (GOOGLE_SHEET_WEBAPP_URL). A failure there is logged and the welcome
 *    email is still sent, as on live.
 * 2. A welcome email goes out through SendGrid (SENDGRID_API_KEY,
 *    SENDGRID_FROM_EMAIL). Live uses @sendgrid/mail; this calls the same v3
 *    API with fetch.
 */
export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ success: false, message: "Valid email is required." }, { status: 400 });
  }

  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ success: false, message: "Valid email is required." }, { status: 400 });
  }

  try {
    const scriptUrl = process.env.GOOGLE_SHEET_WEBAPP_URL;
    if (scriptUrl) {
      // The Apps Script doPost reads form data, not JSON.
      const sheet = await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email }).toString(),
      });
      if (!sheet.ok) console.error("Failed to save to Google Sheets:", await sheet.text());
    }

    const businessName = process.env.BUSINESS_NAME || "Spa Bali Moon";
    const sent = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: process.env.SENDGRID_FROM_EMAIL, name: businessName },
        subject: `Welcome to ${businessName} Newsletter!`,
        content: [{ type: "text/html", value: welcomeEmail(businessName) }],
      }),
    });
    if (!sent.ok) {
      const body = (await sent.json().catch(() => null)) as { errors?: { message?: string }[] } | null;
      console.error("Subscription Error:", sent.status, body);
      return NextResponse.json(
        { success: false, message: body?.errors?.[0]?.message || "Failed to subscribe. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Thanks for subscribing!" });
  } catch (error) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ success: false, message: "Failed to subscribe. Please try again later." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, message: "Method Not Allowed" }, { status: 405 });
}

/** The live welcome email, unchanged. */
function welcomeEmail(businessName: string) {
  return `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0ebe1;">
                    <div style="background-color: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 3px solid #b8952e;">
                        <img loading="lazy" decoding="async" src="https://spabalimoon.com/images/logo/sbm.webp" alt="${businessName}" style="max-height: 80px; width: auto; margin-bottom: 15px;" />
                        <p style="color: #b8952e; margin: 0; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">Relax &bull; Rejuvenate &bull; Restore</p>
                    </div>
                    <div style="padding: 35px 30px;">
                        <div style="background-color: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e5ddd0; text-align: center;">
                            <h2 style="color: #3d3428; margin: 0 0 15px; font-size: 22px; font-weight: 500;">Thank You for Subscribing!</h2>
                            <p style="color: #6b5e4e; line-height: 1.8; margin: 0 0 20px; font-size: 15px;">
                                You are now on the VIP list for <strong>${businessName}</strong>.
                            </p>
                            <p style="color: #6b5e4e; line-height: 1.8; margin: 0 0 20px; font-size: 14px;">
                                We'll keep you updated with our latest spa treatments, exclusive promotions, and wellness tips straight to your inbox.
                            </p>

                            <div style="text-align: center; margin-top: 30px;">
                                <a href="https://spabalimoon.com" style="display: inline-block; background-color: #b8952e; color: #ffffff; padding: 14px 36px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; letter-spacing: 0.5px;">Book a Treatment</a>
                            </div>
                        </div>
                    </div>
                    <div style="padding: 30px; text-align: center; border-top: 1px solid #e5ddd0;">
                        <h3 style="color: #3d3428; margin: 0 0 12px; font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Contact Info</h3>
                        <p style="margin: 0 0 5px; color: #6b5e4e; font-size: 13px;">Jl. Pangkung Sari No. 30, Seminyak, Bali</p>
                        <p style="margin: 0 0 5px; color: #6b5e4e; font-size: 13px;">+62 878-6317-5144</p>
                        <p style="margin: 0 0 20px; font-size: 13px;"><a href="mailto:info@spabalimoon.com" style="color: #b8952e; text-decoration: none;">info@spabalimoon.com</a></p>

                        <div style="margin-bottom: 20px;">
                            <a href="#" style="display: inline-block; width: 28px; height: 28px; border: 1px solid #d5ccbe; border-radius: 50%; color: #8b7d6b; text-align: center; line-height: 26px; font-size: 12px; text-decoration: none; margin: 0 5px; font-weight: bold;">X</a>
                            <a href="#" style="display: inline-block; width: 28px; height: 28px; border: 1px solid #d5ccbe; border-radius: 50%; color: #8b7d6b; text-align: center; line-height: 26px; font-size: 12px; text-decoration: none; margin: 0 5px; font-weight: bold; font-family: serif;">f</a>
                            <a href="#" style="display: inline-block; width: 28px; height: 28px; border: 1px solid #d5ccbe; border-radius: 50%; color: #8b7d6b; text-align: center; line-height: 26px; font-size: 12px; text-decoration: none; margin: 0 5px; font-weight: bold;">in</a>
                            <a href="#" style="display: inline-block; width: 28px; height: 28px; border: 1px solid #d5ccbe; border-radius: 50%; color: #8b7d6b; text-align: center; line-height: 26px; font-size: 12px; text-decoration: none; margin: 0 5px; font-weight: bold;">ig</a>
                        </div>
                    </div>
                </div>
            `;
}
