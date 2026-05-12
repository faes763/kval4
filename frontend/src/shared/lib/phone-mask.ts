/**
 * Маска телефона по заданию: 8(XXX)XXX-XX-XX.
 * Принимает только цифры; вставки вида +7… приводятся к формату с ведущей 8.
 */
export function formatPhoneMask(raw: string): string {
	let d = raw.replace(/\D/g, "");
	if (!d.length) return "";

	if (d.length === 11 && d[0] === "7") {
		d = `8${d.slice(1)}`;
	}
	if (d[0] !== "8") {
		d = `8${d.replace(/^8+/, "")}`;
	}
	d = d.slice(0, 11);

	if (d.length <= 1) return "8";

	const a = d.slice(1, 4);
	let out = `8(${a}`;
	if (d.length <= 4) return out;

	const b = d.slice(4, 7);
	out += `)${b}`;
	if (d.length <= 7) return out;

	const c = d.slice(7, 9);
	out += `-${c}`;
	if (d.length <= 9) return out;

	out += `-${d.slice(9, 11)}`;
	return out;
}

/** Вешает форматирование на поле ввода (без перезагрузки страницы). */
export function attachPhoneMask(input: HTMLInputElement): void {
	const apply = () => {
		const next = formatPhoneMask(input.value);
		if (next !== input.value) {
			input.value = next;
		}
	};
	input.addEventListener("input", apply);
	input.addEventListener("paste", () => {
		queueMicrotask(apply);
	});
}
