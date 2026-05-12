import * as jose from "jose";
import { getConfigValueOrThrow } from "@/common/config/get.config";

export type JwtRole = "user" | "admin";

export type JwtPayload = {
	sub: string;
	role: JwtRole;
};

function getSecret(): Uint8Array {
	const raw = getConfigValueOrThrow("JWT_SECRET");
	return new TextEncoder().encode(raw);
}

export async function signUserToken(userId: number): Promise<string> {
	const secret = getSecret();
	return new jose.SignJWT({ role: "user" satisfies JwtRole })
		.setProtectedHeader({ alg: "HS256" })
		.setSubject(String(userId))
		.setExpirationTime("7d")
		.sign(secret);
}

export async function signAdminToken(): Promise<string> {
	const secret = getSecret();
	return new jose.SignJWT({ role: "admin" satisfies JwtRole })
		.setProtectedHeader({ alg: "HS256" })
		.setSubject("admin")
		.setExpirationTime("8h")
		.sign(secret);
}

export async function verifyBearerToken(
	authHeader: string | null,
): Promise<JwtPayload | null> {
	if (!authHeader?.startsWith("Bearer ")) return null;
	const token = authHeader.slice(7).trim();
	if (!token) return null;
	try {
		const secret = getSecret();
		const { payload } = await jose.jwtVerify(token, secret);
		const role = payload.role as JwtRole | undefined;
		const sub = payload.sub;
		if (!sub || (role !== "user" && role !== "admin")) return null;
		return { sub, role };
	} catch {
		return null;
	}
}
