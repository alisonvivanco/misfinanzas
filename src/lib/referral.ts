import { User } from "@/models/User";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O/0/I/1 para evitar confusión

/** Generates an 8-char readable referral code. */
export function generateReferralCode(): string {
  let out = "";
  const buf = new Uint8Array(8);
  crypto.getRandomValues(buf);
  for (let i = 0; i < 8; i++) out += ALPHABET[buf[i] % ALPHABET.length];
  return out;
}

/**
 * Returns the user's referralCode, generating one lazily if missing.
 * Idempotent — safe to call repeatedly.
 */
export async function ensureReferralCode(userId: string): Promise<string> {
  const existing = await User.findById(userId).select("referralCode").lean();
  if (existing?.referralCode) return existing.referralCode;

  // Try a few times in case of collision (probability is astronomically low).
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    try {
      await User.updateOne({ _id: userId }, { $set: { referralCode: code } });
      return code;
    } catch (e) {
      if (e instanceof Error && /duplicate key/i.test(e.message)) continue;
      throw e;
    }
  }
  throw new Error("No se pudo generar un código de referido único");
}
