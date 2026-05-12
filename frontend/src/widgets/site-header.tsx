"use client";

import { useEffect, useState } from "react";
import { navigate } from "astro:transitions/client";
import { cn } from "@/lib/utils";
import {
	clearUserToken,
	getUserToken,
	subscribeAuthChanged,
} from "@/shared/api/client";

export function SiteHeader() {
	const [hasUser, setHasUser] = useState(
		() => typeof window !== "undefined" && !!getUserToken(),
	);

	useEffect(() => {
		const sync = () => setHasUser(!!getUserToken());
		sync();
		return subscribeAuthChanged(sync);
	}, []);

	function onLogout() {
		clearUserToken();
		void navigate("/");
	}

	return (
		<header className="border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
			<div className="container mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
				<a
					href="/"
					className="text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
				>
					Корочки.есть
				</a>
				<nav
					className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground"
					aria-label="Навигация"
				>
					{hasUser ? (
						<>
							<a
								href="/applications"
								className={cn(
									"rounded-md transition-colors hover:text-foreground",
									"underline-offset-4 hover:underline",
								)}
							>
								Заявки
							</a>
							<button
								type="button"
								className={cn(
									"rounded-md transition-colors hover:text-foreground",
									"underline-offset-4 hover:underline",
								)}
								onClick={onLogout}
							>
								Выйти
							</button>
						</>
					) : (
						<>
							<a
								href="/register"
								className={cn(
									"rounded-md transition-colors hover:text-foreground",
									"underline-offset-4 hover:underline",
								)}
							>
								Регистрация
							</a>
							<a
								href="/login"
								className={cn(
									"rounded-md transition-colors hover:text-foreground",
									"underline-offset-4 hover:underline",
								)}
							>
								Вход
							</a>
						</>
					)}
					<a
						href="/admin"
						className={cn(
							"rounded-md transition-colors hover:text-foreground",
							"underline-offset-4 hover:underline",
						)}
					>
						Админ
					</a>
				</nav>
			</div>
		</header>
	);
}
