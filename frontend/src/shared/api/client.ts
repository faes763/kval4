/** Fetch к API без перезагрузки страницы */

export const STORAGE_USER_TOKEN = "course-portal:userToken";
export const STORAGE_ADMIN_TOKEN = "course-portal:adminToken";

export function apiBase(): string {
	return import.meta.env.PUBLIC_API_URL ?? "http://localhost:4444";
}

export function getUserToken(): string | null {
	if (typeof localStorage === "undefined") return null;
	return localStorage.getItem(STORAGE_USER_TOKEN);
}

const AUTH_CHANGED_EVENT = "course-portal-auth-changed";

function emitAuthChanged(): void {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
}

/** Подписка на вход/выход (одна вкладка). Вызывается из `setUserToken` / `clearUserToken`. */
export function subscribeAuthChanged(listener: () => void): () => void {
	if (typeof window === "undefined") return () => {};
	window.addEventListener(AUTH_CHANGED_EVENT, listener);
	return () => window.removeEventListener(AUTH_CHANGED_EVENT, listener);
}

export function setUserToken(token: string): void {
	localStorage.setItem(STORAGE_USER_TOKEN, token);
	emitAuthChanged();
}

export function clearUserToken(): void {
	localStorage.removeItem(STORAGE_USER_TOKEN);
	emitAuthChanged();
}

export function getAdminToken(): string | null {
	return localStorage.getItem(STORAGE_ADMIN_TOKEN);
}

export function setAdminToken(token: string): void {
	localStorage.setItem(STORAGE_ADMIN_TOKEN, token);
}

export function clearAdminToken(): void {
	localStorage.removeItem(STORAGE_ADMIN_TOKEN);
}

type Json = Record<string, unknown>;

export async function apiFetch<T extends Json>(
	path: string,
	init?: RequestInit & { token?: string | null },
): Promise<T> {
	const url = `${apiBase()}${path}`;
	const headers = new Headers(init?.headers);
	if (!headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}
	const tok = init?.token;
	if (tok) {
		headers.set("Authorization", `Bearer ${tok}`);
	}
	const res = await fetch(url, { ...init, headers });
	const body = (await res.json().catch(() => ({}))) as Json & {
		error?: string;
	};
	if (!res.ok) {
		const msg =
			typeof body.error === "string"
				? body.error
				: `Запрос не выполнен (${res.status})`;
		throw new Error(msg);
	}
	return body as T;
}
