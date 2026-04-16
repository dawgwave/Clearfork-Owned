import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/recaptcha";

const DEFAULT_NOCODB_BASE = "https://data.levelingupdata.com";
const DEFAULT_QUOTE_TABLE_ID = "mwfajwaagzzrsjy";

function nocoRecordsUrl(): string {
  const base = (process.env.NOCODB_BASE_URL || DEFAULT_NOCODB_BASE).replace(/\/$/, "");
  const tableId = process.env.NOCODB_QUOTE_TABLE_ID?.trim() || DEFAULT_QUOTE_TABLE_ID;
  return `${base}/api/v2/tables/${tableId}/records`;
}

/** NocoDB PhoneNumber (validate) only accepts digit-only strings. */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

function str(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data?.firstName || !data?.lastName) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    if (data.recaptchaToken) {
      const captcha = await verifyRecaptcha(data.recaptchaToken);
      if (!captcha.success || captcha.score < 0.5) {
        return NextResponse.json(
          { message: "reCAPTCHA verification failed" },
          { status: 400 },
        );
      }
    }

    const token = process.env.NOCODB_API_TOKEN;
    if (!token) {
      console.error("[quote-submit] NOCODB_API_TOKEN not set");
      return NextResponse.json({ message: "Database not configured." }, { status: 500 });
    }

    const record: Record<string, string> = {
      "First Name": str(data.firstName),
      "Last Name": str(data.lastName),
      "Date of Birth": str(data.dateOfBirth),
      "Marital Status": str(data.maritalStatus),
      "Gender": str(data.gender),
      "Street Address": str(data.streetAddress),
      "State": str(data.state),
      "Zip Code": str(data.zipCode),
      "Phone Number": normalizePhone(str(data.phoneNumber)),
      "Can Receive Texts": str(data.canReceiveTexts),
      "Email": str(data.emailAddress),
      "Driver License Number": str(data.driverLicenseNumber),
      "Social Security Number": str(data.socialSecurityNumber),
      "Additional Driver First Name": str(data.additionalDriverFirstName),
      "Additional Driver Last Name": str(data.additionalDriverLastName),
      "Additional Driver DOB": str(data.additionalDriverDOB),
      "Additional Driver License": str(data.additionalDriverLicense),
      "VIN Number": str(data.vinNumber),
      "Vehicle Use": str(data.vehicleUse),
      "Estimated Annual Mileage": str(data.estimatedAnnualMileage),
      "Occupation": str(data.occupation),
      "Military Service": str(data.militaryService),
      "Is Student": str(data.isStudent),
      "Submitted At": new Date().toISOString(),
      "Status": "New",
    };

    const response = await fetch(nocoRecordsUrl(), {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "xc-token": token,
      },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[quote-submit] NocoDB error:", response.status, errorText);
      return NextResponse.json({ message: "Failed to save quote." }, { status: 500 });
    }

    const result = (await response.json()) as { Id?: number; id?: number };
    return NextResponse.json({ success: true, id: result.Id ?? result.id });
  } catch (error) {
    console.error("[quote-submit] error:", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
