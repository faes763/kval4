import { Elysia, t } from "elysia";
import { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/database";
import { signAdminToken, verifyBearerToken } from "@/common/auth/jwt";

const ADMIN_LOGIN = "Admin";
const ADMIN_PASSWORD = "KorokNET";

const loginBody = t.Object({
	login: t.String(),
	password: t.String(),
});

const patchBody = t.Object({
	status: t.Union([t.Literal("IN_PROGRESS"), t.Literal("COMPLETED")]),
});

function mapPayment(m: string): string {
	switch (m) {
		case "CASH":
			return "Наличные";
		case "PHONE_TRANSFER":
			return "Перевод по номеру телефона";
		default:
			return m;
	}
}

function mapStatus(s: string): string {
	switch (s) {
		case "NEW":
			return "Новая";
		case "IN_PROGRESS":
			return "Идет обучение";
		case "COMPLETED":
			return "Обучение завершено";
		default:
			return s;
	}
}

/** Панель администратора (вход Admin / KorokNET) */
export const adminPlugin = new Elysia({ prefix: "/admin" })
	.post(
		"/login",
		async ({ body, set }) => {
			if (body.login !== ADMIN_LOGIN || body.password !== ADMIN_PASSWORD) {
				set.status = 401;
				return {
					ok: false as const,
					error: "Неверный логин или пароль администратора.",
				};
			}
			const token = await signAdminToken();
			return { ok: true as const, token };
		},
		{ body: loginBody },
	)
	.guard(
		{
			async beforeHandle({ request, set }) {
				const p = await verifyBearerToken(
					request.headers.get("authorization"),
				);
				if (!p || p.role !== "admin") {
					set.status = 401;
					return {
						ok: false as const,
						error: "Требуется вход администратора.",
					};
				}
			},
		},
		(app) =>
			app
				.get("/applications", async () => {
					const rows = await prisma.application.findMany({
						orderBy: { submittedAt: "desc" },
						include: {
							user: { select: { login: true, fullName: true, email: true } },
						},
					});
					return {
						ok: true as const,
						items: rows.map((r) => ({
							id: r.id,
							userLogin: r.user.login,
							userFullName: r.user.fullName,
							userEmail: r.user.email,
							courseName: r.courseName,
							startDate: r.startDate.toISOString().slice(0, 10),
							paymentMethod: mapPayment(r.paymentMethod),
							paymentMethodRaw: r.paymentMethod,
							status: mapStatus(r.status),
							statusRaw: r.status,
							submittedAt: r.submittedAt.toISOString(),
							feedback: r.feedback,
						})),
					};
				})
				.patch(
					"/applications/:id",
					async ({ params, body, set }) => {
						const id = Number(params.id);
						if (!Number.isFinite(id)) {
							set.status = 400;
							return { ok: false as const, error: "Некорректный id." };
						}

						const next =
							body.status === "IN_PROGRESS"
								? ApplicationStatus.IN_PROGRESS
								: ApplicationStatus.COMPLETED;

						try {
							const updated = await prisma.$transaction(async (tx) => {
								const exists = await tx.application.findUnique({
									where: { id },
								});
								if (!exists) return null;
								return tx.application.update({
									where: { id },
									data: { status: next },
								});
							});
							if (!updated) {
								set.status = 404;
								return { ok: false as const, error: "Заявка не найдена." };
							}
							return {
								ok: true as const,
								application: {
									id: updated.id,
									status: mapStatus(updated.status),
									statusRaw: updated.status,
								},
							};
						} catch {
							set.status = 500;
							return {
								ok: false as const,
								error: "Не удалось обновить статус.",
							};
						}
					},
					{ body: patchBody },
				),
	);

