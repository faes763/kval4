import { PrismaClient } from "@prisma/client";

// Формируем DATABASE_URL из POSTGRES_* переменных, если DATABASE_URL не установлен
if (!process.env.DATABASE_URL) {
	const postgresUser = process.env.POSTGRES_USER || "postgres";
	const postgresPassword = process.env.POSTGRES_PASSWORD || "";
	const postgresDb = process.env.POSTGRES_DB || "postgres";
	const postgresHost = process.env.POSTGRES_HOST || "localhost";
	const postgresPort = process.env.POSTGRES_PORT || "5432";

	process.env.DATABASE_URL = `postgresql://${postgresUser}:${postgresPassword}@${postgresHost}:${postgresPort}/${postgresDb}`;
}

export const prisma = new PrismaClient({
	log:
		process.env.NODE_ENV === "development"
			? ["query", "error", "warn"]
			: ["error"],
});

// Подключаемся к БД при инициализации
prisma.$connect().catch((error: unknown) => {
	console.error("Failed to connect to database:", error);
	process.exit(1);
});

// Graceful shutdown
process.on("beforeExit", async () => {
	await prisma.$disconnect();
});
