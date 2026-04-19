import { NextRequest, NextResponse } from "next/server";
import { isRecaptchaVerificationEnabled, verifyRecaptcha } from "@/lib/recaptcha";
import { insertQuote, testConnection } from "@/lib/database";
import { getUserFromRequest } from "@/lib/auth-middleware";
import {
  mileageBandToInt,
  militaryServiceToBool,
  normalizeGender,
  normalizeMaritalStatus,
  normalizeVehicleUse,
  yesNoToBool,
} from "@/lib/quote-normalize";

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

/** Convert MM/DD/YYYY or MM-DD-YYYY to YYYY-MM-DD for MySQL */
function formatDateForMySQL(dateStr: string): string | undefined {
  if (!dateStr || dateStr.trim() === "") return undefined;
  
  // Handle MM/DD/YYYY or MM-DD-YYYY formats
  const match = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  console.warn(`[quote-submit] Invalid date format: ${dateStr}`);
  return undefined;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    const data = await req.json();
    if (!data?.firstName || !data?.lastName) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    if (
      data.recaptchaToken &&
      isRecaptchaVerificationEnabled()
    ) {
      const captcha = await verifyRecaptcha(data.recaptchaToken);
      if (!captcha.success || captcha.score < 0.5) {
        console.error("[quote-submit] reCAPTCHA verification failed");
        return NextResponse.json(
          { message: "reCAPTCHA verification failed" },
          { status: 400 },
        );
      }
    }

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error("[quote-submit] Database connection failed");
      return NextResponse.json({ message: "Database not available." }, { status: 500 });
    }

    const maritalRaw = str(data.maritalStatus);
    const genderRaw = str(data.gender);
    const vehicleRaw = str(data.vehicleUse);
    const mileageRaw = str(data.estimatedAnnualMileage);

    // Prepare data for MySQL insertion (ENUMs + NOT NULL columns must match schema)
    const quoteData = {
      userId: user?.id, // Set user_id if user is authenticated, otherwise undefined (NULL)
      firstName: str(data.firstName),
      lastName: str(data.lastName),
      dateOfBirth: formatDateForMySQL(str(data.dateOfBirth)),
      maritalStatus: maritalRaw ? normalizeMaritalStatus(maritalRaw) : undefined,
      gender: genderRaw ? normalizeGender(genderRaw) : undefined,
      streetAddress: str(data.streetAddress) || undefined,
      state: str(data.state) || undefined,
      zipCode: str(data.zipCode) || undefined,
      phoneNumber: normalizePhone(str(data.phoneNumber)) || undefined,
      canReceiveTexts: yesNoToBool(data.canReceiveTexts, false),
      emailAddress: str(data.emailAddress) || undefined,
      driverLicenseNumber: str(data.driverLicenseNumber) || undefined,
      socialSecurityNumber: str(data.socialSecurityNumber).trim() || "000000000",
      additionalDriverFirstName: str(data.additionalDriverFirstName) || undefined,
      additionalDriverLastName: str(data.additionalDriverLastName) || undefined,
      additionalDriverDOB: formatDateForMySQL(str(data.additionalDriverDOB)),
      additionalDriverLicense: str(data.additionalDriverLicense) || undefined,
      vinNumber: str(data.vinNumber).trim() || "PENDING0000000001",
      vehicleUse: normalizeVehicleUse(vehicleRaw),
      estimatedAnnualMileage: mileageBandToInt(mileageRaw),
      occupation: str(data.occupation).trim() || "Not specified",
      militaryService: militaryServiceToBool(str(data.militaryService)),
      isStudent: yesNoToBool(data.isStudent, false),
    };

    // Insert quote into MySQL database
    const insertedId = await insertQuote(quoteData);
    
    return NextResponse.json({ success: true, id: insertedId });
  } catch (error) {
    const err = error as Error & { code?: string; sqlMessage?: string };
    console.error(
      "[quote-submit] Error:",
      err?.message,
      err?.code,
      err?.sqlMessage,
    );
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
