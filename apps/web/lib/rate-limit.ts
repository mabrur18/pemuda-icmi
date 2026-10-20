/**
 * In-Memory Token-Bucket / Sliding Window Rate Limiter (FR-602, NFR-03)
 * Digunakan pada Server Route Handler untuk membatasi frekuensi submit formulir per IP.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Bersihkan entri kedaluwarsa secara berkala setiap 5 menit
if (typeof setInterval !== "undefined") {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  // Unref interval jika di lingkungan Node.js agar tidak menahan proses exit
  if (cleanupInterval && typeof cleanupInterval.unref === "function") {
    cleanupInterval.unref();
  }
}

export interface RateLimitOptions {
  limit?: number; // Jumlah permintaan maksimum dalam jendela waktu (default: 5)
  windowMs?: number; // Jendela waktu dalam milidetik (default: 60 detik)
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Memeriksa apakah IP pemanggil telah melebihi batas laju permintaan.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const limit = options.limit ?? 5;
  const windowMs = options.windowMs ?? 60 * 1000;
  const now = Date.now();

  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    // Entri baru atau jendela waktu telah berakhir
    const resetAt = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetAt,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Mengambil IP klien dari HTTP headers Request.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Helper untuk reset map di lingkungan pengujian
 */
export function _resetRateLimitMap(): void {
  rateLimitMap.clear();
}
