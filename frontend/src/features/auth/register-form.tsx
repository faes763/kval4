"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { navigate } from "astro:transitions/client";
import { apiFetch } from "@/shared/api/client";
import { formatPhoneMask } from "@/shared/lib/phone-mask";
import {
	validateEmail,
	validateFullName,
	validateLogin,
	validatePassword,
	validatePhone,
} from "@/shared/lib/validators";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
	const [login, setLogin] = useState("");
	const [password, setPassword] = useState("");
	const [showPw, setShowPw] = useState(false);
	const [fullName, setFullName] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		const err =
			validateLogin(login) ??
			validatePassword(password) ??
			validateFullName(fullName) ??
			validatePhone(phone) ??
			validateEmail(email);
		if (err) {
			toast.error(err);
			return;
		}
		setLoading(true);
		try {
			const res = await apiFetch<{ ok: boolean }>("/api/auth/register", {
				method: "POST",
				body: JSON.stringify({
					login: login.trim(),
					password,
					fullName: fullName.trim(),
					phone: phone.trim(),
					email: email.trim(),
				}),
			});
			if (res.ok) {
				toast.success("Регистрация успешна.");
				await navigate("/login");
			}
		} catch (ex) {
			toast.error(ex instanceof Error ? ex.message : "Ошибка регистрации");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card className="mx-auto w-full max-w-md shadow-lg">
			<CardHeader>
				<CardTitle>Регистрация</CardTitle>
				<CardDescription>
					Все поля обязательны. Данные проверяются на сервере.
				</CardDescription>
			</CardHeader>
			<form onSubmit={onSubmit}>
				<CardContent className="flex flex-col gap-4">
					<div className="space-y-2">
						<Label htmlFor="reg-login">Логин (латиница и цифры, ≥ 6)</Label>
						<Input
							id="reg-login"
							value={login}
							onChange={(e) => setLogin(e.target.value)}
							autoComplete="username"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="reg-password">Пароль (≥ 8 символов)</Label>
						<div className="relative">
							<Input
								id="reg-password"
								type={showPw ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete="new-password"
								className="pr-11"
								required
							/>
							<button
								type="button"
								className="absolute top-1/2 right-1.5 size-8 -translate-y-1/2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
								onClick={() => setShowPw((v) => !v)}
								aria-label={showPw ? "Скрыть пароль" : "Показать пароль"}
								tabIndex={-1}
							>
								{showPw ? (
									<EyeOff className="mx-auto size-4" />
								) : (
									<Eye className="mx-auto size-4" />
								)}
							</button>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="reg-name">ФИО (кириллица)</Label>
						<Input
							id="reg-name"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							autoComplete="name"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="reg-phone">Телефон 8(XXX)XXX-XX-XX</Label>
						<Input
							id="reg-phone"
							inputMode="numeric"
							placeholder="8(999)123-45-67"
							maxLength={15}
							value={phone}
							onChange={(e) =>
								setPhone(formatPhoneMask(e.target.value))
							}
							autoComplete="tel"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="reg-email">Email</Label>
						<Input
							id="reg-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							autoComplete="email"
							required
						/>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
					<Button type="submit" disabled={loading} className="w-full sm:w-auto">
						{loading ? "Отправка…" : "Создать пользователя"}
					</Button>
					<p className="text-center text-sm text-muted-foreground">
						<a href="/login" className="underline underline-offset-4">
							Уже зарегистрированы? Войти
						</a>
					</p>
				</CardFooter>
			</form>
		</Card>
	);
}
