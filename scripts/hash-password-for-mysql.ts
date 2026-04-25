/**
 * Read a password from stdin (no argv), print bcrypt hash suitable for users.password_hash.
 * Matches BCRYPT_ROUNDS in src/lib/auth.ts (12).
 *
 * Usage (password not echoed, not kept in shell history for the read):
 *   read -s -p "New password: " PW; echo; printf %s "$PW" | npx tsx scripts/hash-password-for-mysql.ts
 *
 * Or one line (password may appear in process list briefly):
 *   printf %s "yourpassword" | npx tsx scripts/hash-password-for-mysql.ts
 */
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

async function readStdinPassword(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw.replace(/\r?\n$/, "");
}

async function main() {
  const password = await readStdinPassword();
  if (!password) {
    console.error(
      "No password on stdin.\nExample: read -s -p \"New password: \" PW; echo; printf %s \"$PW\" | npx tsx scripts/hash-password-for-mysql.ts",
    );
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  process.stdout.write(hash + "\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
