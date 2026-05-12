"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { navigate } from "astro:transitions/client";
import { apiFetch, setUserToken } from "@/shared/api/client";
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

export function LoginForm() {
	const [login, setLogin] = useState("");
	const [password, setPassword] = useState("");
	const [showPw, setShowPw] = useState(false);
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		const u = login.trim();
		if (!u || !password) {
			toast.error("Укажите логин и пароль.");
			return;
		}
		setLoading(true);
		try {
			const res = await apiFetch<{ ok: boolean; token?: string }>(
				"/api/auth/login",
				{
					method: "POST",
					body: JSON.stringify({ login: u, password }),
				},
			);
			if (res.ok && res.token) {
				setUserToken(res.token);
				toast.success("Добро пожаловать.");
				await navigate("/applications");
			}
		} catch (ex) {
			toast.error(ex instanceof Error ? ex.message : "Ошибка входа");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card className="mx-auto w-full max-w-md shadow-lg">
			<CardHeader>
				<CardTitle>Вход</CardTitle>
				<CardDescription>Введите логин и пароль.</CardDescription>
			</CardHeader>
			<form onSubmit={onSubmit}>
				<CardContent className="flex flex-col gap-4">
					<div className="space-y-2">
						<Label htmlFor="login-user">Логин</Label>
						<Input
							id="login-user"
							value={login}
							onChange={(e) => setLogin(e.target.value)}
							autoComplete="username"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="login-pass">Пароль</Label>
						<div className="relative">
							<Input
								id="login-pass"
								type={showPw ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete="current-password"
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
				</CardContent>
				<CardFooter className="flex flex-col gap-4 sm:flex-row sm:justify-between">
					<Button type="submit" disabled={loading} className="w-full sm:w-auto">
						{loading ? "Вход…" : "Войти"}
					</Button>
					<p className="text-center text-sm text-muted-foreground">
						<a href="/register" className="underline underline-offset-4">
							Ещё не зарегистрированы? Регистрация
						</a>
					</p>
				</CardFooter>
			</form>
		</Card>
	);
}
