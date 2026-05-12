"use client";

import { useEffect, useState } from "react";
import {
	getUserToken,
	subscribeAuthChanged,
} from "@/shared/api/client";

/** Карточки главной: «Заявки» только при наличии пользовательского токена. */
export function HomeLinks() {
	const [hasUser, setHasUser] = useState(
		() => typeof window !== "undefined" && !!getUserToken(),
	);

	useEffect(() => {
		const sync = () => setHasUser(!!getUserToken());
		sync();
		return subscribeAuthChanged(sync);
	}, []);

	return (
		<ul className="flex flex-col gap-3">
			{!hasUser ? (
				<>
					<li>
						<a
							href="/register"
							className="block rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
						>
							<h2 className="font-semibold text-lg">Регистрация</h2>
							<p className="mt-1 text-muted-foreground text-sm">
								Создать учётную запись
							</p>
						</a>
					</li>
					<li>
						<a
							href="/login"
							className="block rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
						>
							<h2 className="font-semibold text-lg">Вход</h2>
							<p className="mt-1 text-muted-foreground text-sm">
								Авторизация пользователя
							</p>
						</a>
					</li>
				</>
			) : (
				<li>
					<a
						href="/applications"
						className="block rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
					>
						<h2 className="font-semibold text-lg">Заявки</h2>
						<p className="mt-1 text-muted-foreground text-sm">
							Просмотр, новая заявка и отзывы
						</p>
					</a>
				</li>
			)}
			<li>
				<a
					href="/admin"
					className="block rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
				>
					<h2 className="font-semibold text-lg">Админ-панель</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						Модерация заявок
					</p>
				</a>
			</li>
		</ul>
	);
}
