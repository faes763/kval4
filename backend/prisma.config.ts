import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Prisma CLI читает конфиг до встроенной загрузки .env — поднимаем переменные явно.
loadEnv({ path: ".env" });

export default defineConfig({
	schema: "./src/database/prisma/schema.prisma",
	datasource: {
		url: env("DATABASE_URL"),
	},
});
