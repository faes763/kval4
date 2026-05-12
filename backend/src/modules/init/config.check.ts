import { getSchemaValidator } from "elysia";
import { log } from "@/common/helpers";
import { ENV_SCHEMA } from "@/env.d";
import { ERRORS_INIT } from "./errors";

/** Ключи из схемы, которые не обязательны в `process.env`. Напишется WARNING в логе */
const OPTIONAL_ENV_KEYS = new Set<string>([]);

export const checkConfig = async () => {
	const schemaKeys = Object.keys(ENV_SCHEMA.properties);
	const errors: string[] = [];

	for (const key of schemaKeys) {
		const value = process.env[key];
		if (value === undefined && OPTIONAL_ENV_KEYS.has(key)) {
			continue;
		}
		if (value === undefined) {
			errors.push(`Missing env var: ${key}`);
		}
	}

	if (errors.length > 0) {
		log("error", `${ERRORS_INIT.MISSING_ENV_VAR} \n${errors.join("\n")}`);
		throw new Error(ERRORS_INIT.MISSING_ENV_VAR);
	}

	const candidate = Object.fromEntries(
		schemaKeys.map((key) => [key, process.env[key]]),
	) as Record<string, unknown>;

	const validator = getSchemaValidator(ENV_SCHEMA);
	const result = validator.safeParse(candidate);

	if (!result.success) {
		const formatted = (result.errors ?? [])
			.map((issue) => {
				if (!issue) return "";
				const path = Array.isArray(issue.path) ? issue.path.join(".") : "";
				const summary = issue.summary ?? issue.message ?? String(issue);
				return path ? `${path}: ${summary}` : summary;
			})
			.filter(Boolean);

		log("error", `${ERRORS_INIT.INVALID_ENV} \n${formatted.join("\n")}`);
		throw new Error(ERRORS_INIT.INVALID_ENV);
	}

	// const technicalWalletMnemonic = process.env.TECHNICAL_WALLET_MNEMONIC;
	// const isTechnicalWalletMnemonicValid = await checkMnemonic(
	// 	technicalWalletMnemonic,
	// );
	// if (!isTechnicalWalletMnemonicValid) {
	// 	log(
	// 		"error",
	// 		`${ERRORS_INIT.INVALID_ENV} \nTECHNICAL_WALLET_MNEMONIC: invalid mnemonic`,
	// 	);
	// 	throw new Error(ERRORS_INIT.INVALID_ENV);
	// }

	log("info", "Config check passed");
	return true;
};
