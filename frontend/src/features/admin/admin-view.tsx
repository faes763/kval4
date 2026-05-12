"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	apiFetch,
	clearAdminToken,
	getAdminToken,
	setAdminToken,
} from "@/shared/api/client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type Item = {
	id: number;
	userLogin: string;
	courseName: string;
	startDate: string;
	paymentMethod: string;
	status: string;
	statusRaw: string;
	submittedAt: string;
	feedback: string | null;
};

function AdminRow({
	item,
	onPatch,
}: {
	item: Item;
	onPatch: (id: number, status: "IN_PROGRESS" | "COMPLETED") => Promise<void>;
}) {
	const locked = item.statusRaw === "COMPLETED";
	const [status, setStatus] = useState<"IN_PROGRESS" | "COMPLETED">(
		item.statusRaw === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
	);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		setStatus(
			item.statusRaw === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
		);
	}, [item.statusRaw]);

	return (
		<TableRow>
			<TableCell>{item.userLogin}</TableCell>
			<TableCell>{item.courseName}</TableCell>
			<TableCell>{item.startDate}</TableCell>
			<TableCell>{item.paymentMethod}</TableCell>
			<TableCell>{item.status}</TableCell>
			<TableCell>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<Select
						value={status}
						onValueChange={(v) =>
							setStatus(v as "IN_PROGRESS" | "COMPLETED")
						}
						disabled={locked}
					>
						<SelectTrigger className="w-full sm:w-[200px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="IN_PROGRESS">Идет обучение</SelectItem>
							<SelectItem value="COMPLETED">Обучение завершено</SelectItem>
						</SelectContent>
					</Select>
					<Button
						type="button"
						size="sm"
						disabled={locked || saving}
						onClick={async () => {
							setSaving(true);
							try {
								await onPatch(item.id, status);
							} finally {
								setSaving(false);
							}
						}}
					>
						{saving ? "…" : "Сохранить"}
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
}

export function AdminView() {
	const [token, setTok] = useState<string | null>(null);
	const [login, setLogin] = useState("");
	const [password, setPassword] = useState("");
	const [items, setItems] = useState<Item[] | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setTok(getAdminToken());
	}, []);

	const load = useCallback(async (t: string) => {
		try {
			const res = await apiFetch<{ ok: boolean; items: Item[] }>(
				"/api/admin/applications",
				{ method: "GET", token: t },
			);
			setItems(res.items ?? []);
		} catch {
			clearAdminToken();
			setTok(null);
			setItems(null);
			toast.error("Нужен вход администратора.");
		}
	}, []);

	useEffect(() => {
		if (token) load(token);
	}, [token, load]);

	async function onAdminLogin(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		try {
			const res = await apiFetch<{ ok: boolean; token?: string }>(
				"/api/admin/login",
				{
					method: "POST",
					body: JSON.stringify({ login, password }),
				},
			);
			if (res.ok && res.token) {
				setAdminToken(res.token);
				setTok(res.token);
				toast.success("Вход выполнен.");
				await load(res.token);
			}
		} catch (ex) {
			toast.error(ex instanceof Error ? ex.message : "Ошибка");
		} finally {
			setLoading(false);
		}
	}

	const patchStatus = useCallback(
		async (id: number, status: "IN_PROGRESS" | "COMPLETED") => {
			const t = getAdminToken();
			if (!t) return;
			try {
				await apiFetch(`/api/admin/applications/${id}`, {
					method: "PATCH",
					token: t,
					body: JSON.stringify({ status }),
				});
				toast.success("Статус обновлён.");
				await load(t);
			} catch (ex) {
				toast.error(ex instanceof Error ? ex.message : "Ошибка");
			}
		},
		[load],
	);

	if (!token) {
		return (
			<Card className="mx-auto w-full max-w-md">
				<CardHeader>
					<CardTitle>Вход администратора</CardTitle>
					<CardDescription>
						Учётные данные из экзаменационного задания.
					</CardDescription>
				</CardHeader>
				<form onSubmit={onAdminLogin}>
					<CardContent className="flex flex-col gap-4">
						<div className="space-y-2">
							<Label htmlFor="adm-login">Логин</Label>
							<Input
								id="adm-login"
								value={login}
								onChange={(e) => setLogin(e.target.value)}
								autoComplete="username"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="adm-pass">Пароль</Label>
							<Input
								id="adm-pass"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete="current-password"
								required
							/>
						</div>
						<Button type="submit" disabled={loading}>
							{loading ? "Вход…" : "Войти"}
						</Button>
					</CardContent>
				</form>
			</Card>
		);
	}

	if (items === null) {
		return <p className="text-muted-foreground">Загрузка…</p>;
	}

	if (items.length === 0) {
		return (
			<p className="text-muted-foreground">Заявок пока нет.</p>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">
					Все заявки
				</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Смена статуса: «Идет обучение» или «Обучение завершено».
				</p>
			</div>
			<div className="overflow-x-auto rounded-xl border border-border/80">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Пользователь</TableHead>
							<TableHead>Курс</TableHead>
							<TableHead>Начало</TableHead>
							<TableHead>Оплата</TableHead>
							<TableHead>Статус</TableHead>
							<TableHead className="min-w-[280px]">Действие</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((r) => (
							<AdminRow key={r.id} item={r} onPatch={patchStatus} />
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
