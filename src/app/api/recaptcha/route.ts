import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token, action, min_score } = await req.json();
    if (!token) {
      return NextResponse.json({ success: false, error: "missing-token" }, { status: 400 });
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ success: false, error: "missing secret key" }, { status: 500 });
    }

    const params = new URLSearchParams();
    params.set("secret", secret);
    params.set("response", token);

    const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const verification = await resp.json();
    const score = Number(verification?.score || 0);
    const minScore = Number(min_score) || 0.5;

    let passed = !!verification?.success;
    if (passed && action && verification?.action !== action) passed = false;
    if (passed && score < minScore) passed = false;

    return NextResponse.json(
      {
        success: passed,
        score,
        action: verification?.action,
      },
      { status: passed ? 200 : 400 },
    );
  } catch (error) {
    console.error("reCAPTCHA error:", error);
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}
