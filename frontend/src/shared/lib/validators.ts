/** Клиентская валидация (дублирует правила бэкенда для UX) */

export const LOGIN_PATTERN = /^[a-zA-Z0-9]{6,}$/;
export const FULL_NAME_PATTERN =
	/^[А-Яа-яЁё]+(?:[\s-]+[А-Яа-яЁё]+)*$/;
export const PHONE_PATTERN = /^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;

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
		return "ФИО: только кириллица, пробелы и дефис.";
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
