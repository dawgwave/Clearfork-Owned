import { NextRequest, NextResponse } from "next/server";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { insertQuote, testConnection } from "@/lib/database";
import { getCurrentUser } from "@/lib/auth-middleware";

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
    // Check if user is authenticated (optional - allows anonymous submissions)
    const { user } = await getCurrentUser(req);
    
    const data = await req.json();
    if (!data?.firstName || !data?.lastName) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    // Skip reCAPTCHA in development if keys not configured
    if (data.recaptchaToken && process.env.RECAPTCHA_SECRET_KEY && process.env.RECAPTCHA_SECRET_KEY !== 'your_recaptcha_secret_key_here') {
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

    // Prepare data for MySQL insertion
    const quoteData = {
      userId: user?.id,  // Set user_id if user is authenticated, otherwise undefined (NULL)
      firstName: str(data.firstName),
      lastName: str(data.lastName),
      dateOfBirth: formatDateForMySQL(str(data.dateOfBirth)),
      maritalStatus: str(data.maritalStatus) || undefined,
      gender: str(data.gender) || undefined,
      streetAddress: str(data.streetAddress) || undefined,
      state: str(data.state) || undefined,
      zipCode: str(data.zipCode) || undefined,
      phoneNumber: normalizePhone(str(data.phoneNumber)) || undefined,
      canReceiveTexts: data.canReceiveTexts === true || data.canReceiveTexts === "true",
      emailAddress: str(data.emailAddress) || undefined,
      driverLicenseNumber: str(data.driverLicenseNumber) || undefined,
      socialSecurityNumber: str(data.socialSecurityNumber) || undefined,
      additionalDriverFirstName: str(data.additionalDriverFirstName) || undefined,
      additionalDriverLastName: str(data.additionalDriverLastName) || undefined,
      additionalDriverDOB: formatDateForMySQL(str(data.additionalDriverDOB)),
      additionalDriverLicense: str(data.additionalDriverLicense) || undefined,
      vinNumber: str(data.vinNumber) || undefined,
      vehicleUse: str(data.vehicleUse) || undefined,
      estimatedAnnualMileage: data.estimatedAnnualMileage ? parseInt(str(data.estimatedAnnualMileage)) : undefined,
      occupation: str(data.occupation) || undefined,
      militaryService: str(data.militaryService) || undefined,
      isStudent: data.isStudent === true || data.isStudent === "true",
    };

    // Insert quote into MySQL database
    const insertedId = await insertQuote(quoteData);
    
    return NextResponse.json({ success: true, id: insertedId });
  } catch (error) {
    console.error("[quote-submit] Error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
