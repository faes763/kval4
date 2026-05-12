import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { authPlugin } from "@/modules/auth/auth.plugin";
import { applicationsPlugin } from "@/modules/applications/applications.plugin";
import { adminPlugin } from "@/modules/admin/admin.plugin";
import { config } from "@/common/helpers";

/** HTTP API под префиксом /api */
export const routers = async () =>
	new Elysia({ prefix: "/api" })
		.onError(({ code, error, set }) => {
			if (code === "VALIDATION") return undefined;
			const msg = error instanceof Error ? error.message : String(error);
			const looksInternal =
				/prisma/i.test(msg) || /invalid `\w+\.\w+`/i.test(msg);
			if (looksInternal) {
				set.status = 400;
				return {
					ok: false as const,
					error: "Не удалось выполнить операцию. Проверьте введённые данные.",
				};
			}
			set.status = 500;
			return {
				ok: false as const,
				error: "Временная ошибка сервера. Попробуйте позже.",
			};
		})
		.use(
			cors({
				origin: config.cors.origin,
				methods: ["GET", "POST", "PATCH", "OPTIONS"],
				allowedHeaders: ["Content-Type", "Authorization"],
			}),
		)
		.use(authPlugin)
		.use(applicationsPlugin)
		.use(adminPlugin);
