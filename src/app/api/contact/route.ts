import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyRecaptcha } from "@/lib/recaptcha";

const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  insuranceType: z.string().optional(),
  message: z.string().optional(),
  recaptchaToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    if (data.recaptchaToken) {
      const captcha = await verifyRecaptcha(data.recaptchaToken);
      if (!captcha.success || captcha.score < 0.5) {
        return NextResponse.json(
          { message: "reCAPTCHA verification failed" },
          { status: 400 },
        );
      }
    }

    console.log("[contact] Submission:", {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      insuranceType: data.insuranceType,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid form data", errors: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ message: "Failed to submit" }, { status: 500 });
  }
}
