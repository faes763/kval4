import type { EnvVars } from "@/env";

export type EnvKey = keyof EnvVars;

/**
 * Типизированный доступ к `process.env` по ключам из `src/env.d.ts`.
 * Без runtime-валидации (возвращает значение в том виде, как объявлено в типах).
 */

export const getConfigValue = <K extends EnvKey>(key: K): EnvVars[K] => {
	return process.env[key] as unknown as EnvVars[K];
};

/**
 * Типизированный доступ к `process.env` по ключам из `src/env.d.ts`.
 * Возвращает значение в том виде, как объявлено в типах.
 */

export const getConfigValueOrThrow = <K extends EnvKey>(key: K): EnvVars[K] => {
	const value = process.env[key];
	if (value === undefined) {
		throw new Error(`Missing env var: ${String(key)}`);
	}

	return value as unknown as EnvVars[K];
};
