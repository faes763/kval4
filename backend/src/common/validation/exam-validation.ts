/** Валидация полей экзаменационного задания «Корочки.есть» */

export const LOGIN_PATTERN = /^[a-zA-Z0-9]{6,}$/;
export const FULL_NAME_PATTERN =
	/^[А-Яа-яЁё]+(?:[\s-]+[А-Яа-яЁё]+)*$/;
export const PHONE_PATTERN = /^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 8;

export type FieldErrors = Record<string, string>;

export function validateLogin(login: string): string | undefined {
	const t = login.trim();
	if (!t) return "Укажите логин.";
	if (!LOGIN_PATTERN.test(t)) {
		return "Логин: только латиница и цифры, не менее 6 символов.";
	}
	return undefined;
}

export function validatePassword(password: string): string | undefined {
	if (!password) return "Укажите пароль.";
	if (password.length < PASSWORD_MIN_LENGTH) {
		return `Пароль: не менее ${PASSWORD_MIN_LENGTH} символов.`;
	}
	return undefined;
}

export function validateFullName(fullName: string): string | undefined {
	const t = fullName.trim();
	if (!t) return "Укажите ФИО.";
	if (!FULL_NAME_PATTERN.test(t)) {
		return "ФИО: только кириллица, пробелы и дефисы между частями.";
	}
	return undefined;
}

export function validatePhone(phone: string): string | undefined {
	const t = phone.trim();
	if (!t) return "Укажите телефон.";
	if (!PHONE_PATTERN.test(t)) {
		return "Телефон: формат 8(XXX)XXX-XX-XX.";
	}
	return undefined;
}

export function validateEmail(email: string): string | undefined {
	const t = email.trim();
	if (!t) return "Укажите email.";
	if (!EMAIL_PATTERN.test(t)) {
		return "Некорректный формат email.";
	}
	return undefined;
}

export function validateCourseName(name: string): string | undefined {
	const t = name.trim();
	if (!t) return "Укажите название курса.";
	if (t.length > 500) return "Название курса слишком длинное.";
	return undefined;
}

export function validateFeedback(text: string): string | undefined {
	const t = text.trim();
	if (!t) return "Введите текст отзыва.";
	if (t.length > 5000) return "Отзыв слишком длинный.";
	return undefined;
}

/**
 * Дата только как YYYY-MM-DD в UTC (полдень), без «плывущего» JS Date из строки и без передачи
 * невалидных значений в Prisma (@db.Date).
 */
export function parseDateOnlyInput(raw: unknown): Date | null {
	if (raw == null) return null;
	const s =
		typeof raw === "string"
			? raw.trim()
			: raw instanceof Date
				? raw.toISOString().slice(0, 10)
				: String(raw).trim();
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
	if (!m) return null;
	const y = Number(m[1]);
	const mo = Number(m[2]);
	const d = Number(m[3]);
	if (y < 1900 || y > 2100) return null;
	if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
	const dt = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0, 0));
	if (
		dt.getUTCFullYear() !== y ||
		dt.getUTCMonth() !== mo - 1 ||
		dt.getUTCDate() !== d
	) {
		return null;
	}
	return dt;
}
