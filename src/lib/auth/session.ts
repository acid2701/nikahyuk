import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface SessionPayload {
  userId: string;
  email: string;
  fullName?: string | null;
  role: string; // 'superadmin' | 'admin' | 'user' | 'vendor'
  userType: string; // 'organizer' | 'vendor'
}

const AUTH_COOKIE_NAME = "nikahyuk_session";
function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.trim().length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL SECURITY ERROR: AUTH_SECRET must be set and at least 32 characters long in production"
      );
    }
  }
  return new TextEncoder().encode(
    secret || "nikahyuk_dev_temporary_fallback_secret_key_32_bytes_safe!"
  );
}

const encodedKey = getAuthSecret();

/**
 * Generate signed JWT token
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(encodedKey);
}

/**
 * Verify JWT token string
 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      fullName: (payload.fullName as string) || null,
      role: (payload.role as string) || "user",
      userType: (payload.userType as string) || "organizer",
    };
  } catch {
    return null;
  }
}

/**
 * Set HTTP-only session cookie
 */
export async function setAuthCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return token;
}

/**
 * Remove HTTP-only session cookie
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Get current session user on server (RSC / Server Actions / Route Handlers)
 */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/**
 * Supabase-compatible Auth User Object adapter
 */
export function formatSupabaseUser(session: SessionPayload) {
  return {
    id: session.userId,
    email: session.email,
    app_metadata: {
      role: session.role,
      provider: "email",
    },
    user_metadata: {
      full_name: session.fullName,
      name: session.fullName,
      phone: "",
      role: session.role,
      user_type: session.userType,
      is_vendor: session.userType === "vendor",
    },
    identities: [] as any[],
    aud: "authenticated",
    created_at: new Date().toISOString(),
  };
}
