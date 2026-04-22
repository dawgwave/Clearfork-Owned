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
import {
  isLineQuoteType,
  parseLineQuoteSubmission,
  QUOTE_TYPE_LABEL,
} from "@/lib/quote-line-schemas";

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

function formatDateForMySQL(dateStr: string): string | undefined {
  if (!dateStr || dateStr.trim() === "") return undefined;

  const match = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  console.warn(`[quote-submit] Invalid date format: ${dateStr}`);
  return undefined;
}

async function verifyCaptchaIfNeeded(recaptchaToken: string | undefined) {
  if (!recaptchaToken || !isRecaptchaVerificationEnabled()) return true;
  const captcha = await verifyRecaptcha(recaptchaToken);
  if (!captcha.success || captcha.score < 0.5) {
    console.error("[quote-submit] reCAPTCHA verification failed");
    return false;
  }
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    const data = await req.json();
    if (!data?.firstName || !data?.lastName) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const qt = str(data.quoteType);

    if (isLineQuoteType(qt)) {
      const parsed = parseLineQuoteSubmission(qt, data);
      if (!parsed.ok) {
        return NextResponse.json(
          { message: parsed.error, issues: parsed.issues },
          { status: 400 },
        );
      }

      if (!(await verifyCaptchaIfNeeded(parsed.data.recaptchaToken))) {
        return NextResponse.json(
          { message: "reCAPTCHA verification failed" },
          { status: 400 },
        );
      }

      const dbConnected = await testConnection();
      if (!dbConnected) {
        console.error("[quote-submit] Database connection failed");
        return NextResponse.json({ message: "Database not available." }, { status: 500 });
      }

      const lifeDobRaw =
        qt === "life" ? str((parsed.data.details as Record<string, unknown>).dateOfBirth) : "";
      const lifeDob = lifeDobRaw ? formatDateForMySQL(lifeDobRaw) : undefined;

      const insertedId = await insertQuote({
        userId: user?.id,
        quoteType: parsed.data.quoteType,
        detailsJson: parsed.data.details,
        firstName: parsed.data.contact.firstName,
        lastName: parsed.data.contact.lastName,
        dateOfBirth: lifeDob,
        maritalStatus: "single",
        gender: "other",
        streetAddress: parsed.data.contact.streetAddress,
        state: parsed.data.contact.state,
        zipCode: parsed.data.contact.zipCode,
        phoneNumber: normalizePhone(parsed.data.contact.phoneNumber) || undefined,
        canReceiveTexts: false,
        emailAddress: parsed.data.contact.emailAddress,
        driverLicenseNumber: "N/A",
        socialSecurityNumber: "000000000",
        vinNumber: "LINEQUOTE-PENDING",
        vehicleUse: "pleasure",
        estimatedAnnualMileage: 0,
        occupation: QUOTE_TYPE_LABEL[parsed.data.quoteType] ?? parsed.data.quoteType,
        militaryService: false,
        isStudent: false,
        extraDrivers: [],
        extraVehicles: [],
      });

      return NextResponse.json({ success: true, id: insertedId });
    }

    if (!(await verifyCaptchaIfNeeded(str(data.recaptchaToken)))) {
      return NextResponse.json(
        { message: "reCAPTCHA verification failed" },
        { status: 400 },
      );
    }

    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error("[quote-submit] Database connection failed");
      return NextResponse.json({ message: "Database not available." }, { status: 500 });
    }

    const maritalRaw = str(data.maritalStatus);
    const genderRaw = str(data.gender);
    const vehicleRaw = str(data.vehicleUse);
    const mileageRaw = str(data.estimatedAnnualMileage);

    const extraDriversIn = Array.isArray(data.extraDrivers) ? data.extraDrivers : [];
    const extraVehiclesIn = Array.isArray(data.extraVehicles) ? data.extraVehicles : [];
    const extraDrivers = (extraDriversIn as Record<string, unknown>[])
      .map((d) => ({
        firstName: str(d?.firstName),
        lastName: str(d?.lastName),
        dateOfBirth: formatDateForMySQL(str(d?.dateOfBirth)) ?? null,
        maritalStatus: d?.maritalStatus
          ? normalizeMaritalStatus(str(d.maritalStatus))
          : "single",
        gender: d?.gender ? normalizeGender(str(d.gender)) : "other",
        driverLicenseNumber: str(d?.driverLicenseNumber) || "",
      }))
      .filter(
        (d) =>
          d.firstName.trim() !== "" &&
          d.lastName.trim() !== "" &&
          d.dateOfBirth &&
          d.driverLicenseNumber.trim() !== "",
      );
    const extraVehFiltered = (extraVehiclesIn as Record<string, unknown>[])
      .map((v) => ({
        vinNumber: str(v?.vinNumber).trim(),
        vehicleUse: normalizeVehicleUse(str(v?.vehicleUse)),
        estimatedAnnualMileage: mileageBandToInt(str(v?.estimatedAnnualMileage)),
      }))
      .filter((v) => v.vinNumber.length > 0);

    const quoteData = {
      userId: user?.id,
      quoteType: "auto" as const,
      detailsJson: null as Record<string, unknown> | null,
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
      vinNumber: str(data.vinNumber).trim() || "PENDING0000000001",
      vehicleUse: normalizeVehicleUse(vehicleRaw),
      estimatedAnnualMileage: mileageBandToInt(mileageRaw),
      occupation: str(data.occupation).trim() || "Not specified",
      militaryService: militaryServiceToBool(str(data.militaryService)),
      isStudent: yesNoToBool(data.isStudent, false),
      extraDrivers,
      extraVehicles: extraVehFiltered,
    };

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
