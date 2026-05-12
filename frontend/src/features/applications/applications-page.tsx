"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { navigate } from "astro:transitions/client";
import {
	apiFetch,
	clearUserToken,
	getUserToken,
} from "@/shared/api/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Row = {
	id: number;
	courseName: string;
	startDate: string;
	paymentMethod: string;
	status: string;
	submittedAt: string;
	feedback: string | null;
};

/**
 * Страницы №3 и №4 задания: таблица заявок, отзывы и форма новой заявки.
 * Доступ только при наличии токена — иначе редирект на /login.
 */
export function ApplicationsPage() {
	const [allowed, setAllowed] = useState(false);
	const [items, setItems] = useState<Row[] | null>(null);
	const [feedbackDraft, setFeedbackDraft] = useState<Record<number, string>>(
		{},
	);

	const [courseName, setCourseName] = useState("");
	const [date, setDate] = useState<Date | undefined>(undefined);
	const [openCal, setOpenCal] = useState(false);
	const [payment, setPayment] = useState<"CASH" | "PHONE_TRANSFER">("CASH");
	const [submitting, setSubmitting] = useState(false);
	const [feedbackSheetRow, setFeedbackSheetRow] = useState<Row | null>(null);
	const [feedbackSending, setFeedbackSending] = useState(false);

	const load = useCallback(async () => {
		const token = getUserToken();
		if (!token) {
			await navigate("/login");
			return;
		}
		try {
			const res = await apiFetch<{ ok: boolean; items: Row[] }>(
				"/api/applications",
				{ method: "GET", token },
			);
			setItems(res.items ?? []);
		} catch {
			clearUserToken();
			toast.error("Сессия недействительна.");
			await navigate("/login");
		}
	}, []);

	useEffect(() => {
		const token = getUserToken();
		if (!token) {
			toast.error("Вход обязателен для просмотра заявок.");
			void navigate("/login");
			return;
		}
		setAllowed(true);
		void load();
	}, [load]);

	async function onCreateSubmit(e: React.FormEvent) {
		e.preventDefault();
		const token = getUserToken();
		if (!token) {
			await navigate("/login");
			return;
		}
		const name = courseName.trim();
		if (!name) {
			toast.error("Укажите название курса.");
			return;
		}
		if (!date) {
			toast.error("Выберите дату начала.");
			return;
		}
		const startDate = format(date, "yyyy-MM-dd");
		setSubmitting(true);
		try {
			await apiFetch("/api/applications", {
				method: "POST",
				token,
				body: JSON.stringify({
					courseName: name,
					startDate,
					paymentMethod: payment,
				}),
			});
			toast.success('Заявка сохранена со статусом «Новая».');
			setCourseName("");
			setDate(undefined);
			setPayment("CASH");
			await load();
			document.getElementById("applications-table")?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		} catch (ex) {
			toast.error(ex instanceof Error ? ex.message : "Ошибка");
		} finally {
			setSubmitting(false);
		}
	}

	async function sendFeedback(id: number) {
		const text = (feedbackDraft[id] ?? "").trim();
		if (!text) {
			toast.error("Введите текст отзыва.");
			return;
		}
		const token = getUserToken();
		if (!token) return;
		setFeedbackSending(true);
		try {
			await apiFetch(`/api/applications/${id}/feedback`, {
				method: "POST",
				token,
				body: JSON.stringify({ text }),
			});
			toast.success("Отзыв сохранён.");
			setFeedbackDraft((d) => ({ ...d, [id]: "" }));
			setFeedbackSheetRow(null);
			await load();
		} catch (ex) {
			toast.error(ex instanceof Error ? ex.message : "Ошибка");
		} finally {
			setFeedbackSending(false);
		}
	}

	if (!allowed) {
		return (
			<p className="text-muted-foreground text-sm">
				Проверка доступа…
			</p>
		);
	}

	if (items === null) {
		return (
			<p className="text-muted-foreground text-sm">Загрузка данных…</p>
		);
	}

	return (
		<div className="space-y-8">
			<header>
				<h1 className="text-2xl font-semibold tracking-tight">
					Заявки на обучение
				</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Таблица заявок и отзывы в боковой панели справа; форма новой заявки —
					узкая колонка. На телефоне форма сверху.
				</p>
			</header>

			<div
				className={cn(
					"grid gap-8 lg:gap-10",
					"lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start",
				)}
			>
				<div className="order-2 min-w-0 space-y-10 lg:order-1">
					<section id="applications-table" className="scroll-mt-24">
						<h2 className="font-semibold text-lg tracking-tight">
							Мои заявки
						</h2>
						<p className="mt-1 text-muted-foreground text-sm">
							Таблица заявок текущего пользователя.
						</p>

						{items.length === 0 ? (
							<p className="mt-4 text-muted-foreground text-sm">
								Пока нет заявок — заполните форму новой заявки (на ПК справа, на
								телефоне — выше).
							</p>
						) : (
							<div className="mt-4 overflow-x-auto rounded-xl border border-border/80 bg-card shadow-sm">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Название курса</TableHead>
											<TableHead>Дата начала</TableHead>
											<TableHead>Способ оплаты</TableHead>
											<TableHead>Статус</TableHead>
											<TableHead>Дата подачи</TableHead>
											<TableHead className="text-right">Отзыв</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{items.map((r) => (
											<TableRow key={r.id}>
												<TableCell className="font-medium">
													{r.courseName}
												</TableCell>
												<TableCell>{r.startDate}</TableCell>
												<TableCell>{r.paymentMethod}</TableCell>
												<TableCell>{r.status}</TableCell>
												<TableCell className="whitespace-nowrap text-muted-foreground text-xs">
													{new Date(r.submittedAt).toLocaleString("ru-RU")}
												</TableCell>
												<TableCell className="text-right">
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => setFeedbackSheetRow(r)}
													>
														{r.feedback ? "Просмотр" : "Написать"}
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</section>

				</div>

				<aside
					id="new-application"
					className="order-1 w-full shrink-0 scroll-mt-24 lg:order-2 lg:w-[24rem]"
				>
					<Card className="shadow-lg lg:sticky lg:top-24">
						<CardHeader>
							<CardTitle>Новая заявка</CardTitle>
							<CardDescription>
								Создание новой заявки на курс.
							</CardDescription>
						</CardHeader>
						<form onSubmit={onCreateSubmit}>
							<CardContent className="flex flex-col gap-4">
								<div className="space-y-2">
									<Label htmlFor="course">Название курса</Label>
									<Input
										id="course"
										value={courseName}
										onChange={(e) => setCourseName(e.target.value)}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label>Желаемая дата начала</Label>
									<Popover open={openCal} onOpenChange={setOpenCal}>
										<PopoverTrigger asChild>
											<Button
												type="button"
												variant="outline"
												className={cn(
													"w-full justify-start text-left font-normal",
													!date && "text-muted-foreground",
												)}
											>
												<CalendarIcon className="mr-2 size-4 shrink-0" />
												<span className="truncate">
													{date
														? format(date, "d MMMM yyyy", { locale: ru })
														: "Выберите дату в календаре"}
												</span>
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={date}
												onSelect={(d) => {
													setDate(d);
													setOpenCal(false);
												}}
												locale={ru}
												captionLayout="dropdown"
											/>
										</PopoverContent>
									</Popover>
								</div>
								<div className="space-y-2">
									<Label>Способ оплаты</Label>
									<Select
										value={payment}
										onValueChange={(v) =>
											setPayment(v as "CASH" | "PHONE_TRANSFER")
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="CASH">Наличные</SelectItem>
											<SelectItem value="PHONE_TRANSFER">
												Перевод по номеру телефона
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									type="submit"
									disabled={submitting}
									className="w-full lg:w-auto"
								>
									{submitting ? "Отправка…" : "Отправить"}
								</Button>
							</CardFooter>
						</form>
					</Card>
				</aside>
			</div>

			<Sheet
				open={feedbackSheetRow !== null}
				onOpenChange={(open) => {
					if (!open) setFeedbackSheetRow(null);
				}}
			>
				<SheetContent side="right" className="flex flex-col overflow-y-auto">
					{feedbackSheetRow ? (
						<>
							<SheetHeader>
								<SheetTitle>
									{feedbackSheetRow.feedback
										? "Ваш отзыв"
										: "Отзыв о курсе"}
								</SheetTitle>
								<SheetDescription>{feedbackSheetRow.courseName}</SheetDescription>
							</SheetHeader>
							{feedbackSheetRow.feedback ? (
								<p className="text-muted-foreground text-sm whitespace-pre-wrap">
									{feedbackSheetRow.feedback}
								</p>
							) : (
								<>
									<Textarea
										className="min-h-[120px] shrink-0"
										placeholder="Текст отзыва о курсе"
										value={feedbackDraft[feedbackSheetRow.id] ?? ""}
										onChange={(e) =>
											setFeedbackDraft((d) => ({
												...d,
												[feedbackSheetRow.id]: e.target.value,
											}))
										}
										rows={5}
									/>
									<SheetFooter className="sm:justify-stretch">
										<Button
											type="button"
											className="w-full sm:w-auto"
											disabled={feedbackSending}
											onClick={() => void sendFeedback(feedbackSheetRow.id)}
										>
											{feedbackSending ? "Отправка…" : "Отправить отзыв"}
										</Button>
									</SheetFooter>
								</>
							)}
						</>
					) : null}
				</SheetContent>
			</Sheet>
		</div>
	);
}
