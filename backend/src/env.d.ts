export {};

import { t, type UnwrapSchema } from "elysia";

export enum NODE_TYPE {
	PRODUCTION = "production",
	DEVELOPMENT = "development",
	STAGE = "stage",
	LOCALHOST = "localhost",
	TEST = "test",
	DEV = "dev",
	PROD = "prod",
}

const NODE_TYPE_VALUES = [
	NODE_TYPE.PRODUCTION,
	NODE_TYPE.DEVELOPMENT,
	NODE_TYPE.STAGE,
	NODE_TYPE.LOCALHOST,
	NODE_TYPE.TEST,
	NODE_TYPE.DEV,
	NODE_TYPE.PROD,
] as const;

export const ENV_SCHEMA = t.Object({
	PORT: t.Numeric(),
	NODE_ENV: t.UnionEnum(NODE_TYPE_VALUES),

	DATABASE_URL: t.String(),
	POSTGRES_USER: t.String({ minLength: 1 }),
	POSTGRES_PASSWORD: t.String({ minLength: 1 }),
	POSTGRES_DB: t.String({ minLength: 1 }),
	JWT_SECRET: t.String({ minLength: 16 }),
});

export type EnvVars = UnwrapSchema<typeof ENV_SCHEMA>;

declare global {
	namespace NodeJS {
		interface ProcessEnv extends EnvVars {}
	}
}
