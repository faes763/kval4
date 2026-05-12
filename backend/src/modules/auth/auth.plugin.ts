import { Elysia, t } from "elysia";
import bcrypt from "bcryptjs";
import { prisma } from "@/database";
import {
	validateEmail,
	validateFullName,
	validateLogin,
	validatePassword,
	validatePhone,
} from "@/common/validation/exam-validation";
import { signUserToken } from "@/common/auth/jwt";

const registerBody = t.Object({
	login: t.String(),
	password: t.String(),
	fullName: t.String(),
	phone: t.String(),
	email: t.String(),
});

const loginBody = t.Object({
	login: t.String(),
	password: t.String(),
});

/** Регистрация и вход пользователя */
export const authPlugin = new Elysia({ prefix: "/auth" })
	.post(
		"/register",
		async ({ body, set }) => {
			const login = body.login.trim();
			const errs = [
				validateLogin(login),
				validatePassword(body.password),
				validateFullName(body.fullName),
				validatePhone(body.phone),
				validateEmail(body.email),
			].filter(Boolean) as string[];
			if (errs.length > 0) {
				set.status = 400;
				return { ok: false as const, error: errs[0] };
			}

			try {
				const passwordHash = await bcrypt.hash(body.password, 12);
				const user = await prisma.$transaction(async (tx) =>
					tx.user.create({
						data: {
							login,
							passwordHash,
							fullName: body.fullName.trim(),
							phone: body.phone.trim(),
							email: body.email.trim(),
						},
						select: { id: true, login: true },
					}),
				);
				return { ok: true as const, user };
			} catch (e: unknown) {
				const code =
					e && typeof e === "object" && "code" in e
						? (e as { code?: string }).code
						: undefined;
				if (code === "P2002") {
					set.status = 409;
					return {
						ok: false as const,
						error: "Пользователь с таким логином уже существует.",
					};
				}
				set.status = 500;
				return { ok: false as const, error: "Не удалось создать пользователя." };
			}
		},
		{ body: registerBody },
	)
	.post(
		"/login",
		async ({ body, set }) => {
			const login = body.login.trim();
			if (!login || !body.password) {
				set.status = 400;
				return { ok: false as const, error: "Укажите логин и пароль." };
			}

			const user = await prisma.user.findUnique({
				where: { login },
			});
			if (!user) {
				set.status = 401;
				return {
					ok: false as const,
					error: "Неверный логин или пароль.",
				};
			}

			const match = await bcrypt.compare(body.password, user.passwordHash);
			if (!match) {
				set.status = 401;
				return {
					ok: false as const,
					error: "Неверный логин или пароль.",
				};
			}

			const token = await signUserToken(user.id);
			return {
				ok: true as const,
				token,
				user: { id: user.id, login: user.login },
			};
		},
		{ body: loginBody },
	);
