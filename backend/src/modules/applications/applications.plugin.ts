import { Elysia, t } from "elysia";
import {
	ApplicationStatus,
	PaymentMethod,
	type Application,
} from "@prisma/client";
import { prisma } from "@/database";
import { verifyBearerToken } from "@/common/auth/jwt";
import {
	parseDateOnlyInput,
	validateCourseName,
	validateFeedback,
} from "@/common/validation/exam-validation";

const createBody = t.Object({
	courseName: t.String(),
	/** ISO date YYYY-MM-DD */
	startDate: t.String(),
	paymentMethod: t.Union([t.Literal("CASH"), t.Literal("PHONE_TRANSFER")]),
});

const feedbackBody = t.Object({
	text: t.String(),
});

function mapPayment(m: PaymentMethod): string {
	switch (m) {
		case "CASH":
			return "Наличные";
		case "PHONE_TRANSFER":
			return "Перевод по номеру телефона";
		default:
			return m;
	}
}

function mapStatus(s: ApplicationStatus): string {
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

function serializeApp(row: Application) {
	return {
		id: row.id,
		courseName: row.courseName,
		startDate: row.startDate.toISOString().slice(0, 10),
		paymentMethod: mapPayment(row.paymentMethod),
		paymentMethodRaw: row.paymentMethod,
		status: mapStatus(row.status),
		statusRaw: row.status,
		submittedAt: row.submittedAt.toISOString(),
		feedback: row.feedback,
		feedbackAt: row.feedbackAt?.toISOString() ?? null,
	};
}

/** Заявки и отзывы текущего пользователя */
export const applicationsPlugin = new Elysia({ prefix: "/applications" })
	.derive(async ({ request }) => {
		const p = await verifyBearerToken(request.headers.get("authorization"));
		const userId =
			p?.role === "user" && p.sub ? Number(p.sub) : (null as number | null);
		return {
			userId: Number.isFinite(userId) ? userId : null,
		};
	})
	.onBeforeHandle(({ userId, set }) => {
		if (userId === null) {
			set.status = 401;
			return { ok: false as const, error: "Требуется вход в систему." };
		}
	})
	.get("/", async ({ userId }) => {
		const rows = await prisma.application.findMany({
			where: { userId: userId as number },
			orderBy: { submittedAt: "desc" },
		});
		return {
			ok: true as const,
			items: rows.map((r) => serializeApp(r)),
		};
	})
	.post(
		"/",
		async ({ body, userId, set }) => {
			const uid = userId as number;
			const cn = validateCourseName(body.courseName);
			if (cn) {
				set.status = 400;
				return { ok: false as const, error: cn };
			}
			const d = parseDateOnlyInput(body.startDate);
			if (!d) {
				set.status = 400;
				return {
					ok: false as const,
					error: "Укажите корректную дату начала (формат ГГГГ-ММ-ДД).",
				};
			}

			const payment =
				body.paymentMethod === "CASH"
					? PaymentMethod.CASH
					: PaymentMethod.PHONE_TRANSFER;

			const created = await prisma.$transaction(async (tx) =>
				tx.application.create({
					data: {
						userId: uid,
						courseName: body.courseName.trim(),
						startDate: d,
						paymentMethod: payment,
						status: ApplicationStatus.NEW,
					},
				}),
			);

			return { ok: true as const, application: serializeApp(created) };
		},
		{ body: createBody },
	)
	.post(
		"/:id/feedback",
		async ({ params, body, userId, set }) => {
			const uid = userId as number;
			const id = Number(params.id);
			if (!Number.isFinite(id)) {
				set.status = 400;
				return { ok: false as const, error: "Некорректный идентификатор." };
			}

			const fe = validateFeedback(body.text);
			if (fe) {
				set.status = 400;
				return { ok: false as const, error: fe };
			}

			try {
				const updated = await prisma.$transaction(async (tx) => {
					const current = await tx.application.findFirst({
						where: { id, userId: uid },
					});
					if (!current) {
						return null;
					}
					return tx.application.update({
						where: { id },
						data: {
							feedback: body.text.trim(),
							feedbackAt: new Date(),
						},
					});
				});

				if (!updated) {
					set.status = 404;
					return { ok: false as const, error: "Заявка не найдена." };
				}
				return { ok: true as const, application: serializeApp(updated) };
			} catch {
				set.status = 500;
				return { ok: false as const, error: "Не удалось сохранить отзыв." };
			}
		},
		{ body: feedbackBody },
	);
