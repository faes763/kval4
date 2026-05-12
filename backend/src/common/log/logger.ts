import { createLogger, format, transports, type Logger } from "winston";
import type { LogLevel } from "../types/logger";
import chalk from "chalk";

const colorizeLevel = (level: LogLevel) => {
	switch (level) {
		case "error":
			return chalk.red(level.toUpperCase());
		case "warn":
			return chalk.yellow(level.toUpperCase());
		case "info":
			return chalk.hex("#FFA500")(level.toUpperCase()); // "оранжевый"
		case "debug":
			return chalk.green(level.toUpperCase());
		case "verbose":
			return chalk.blue(level.toUpperCase());
		case "http":
			return chalk.cyan(level.toUpperCase());
		case "silly":
			return chalk.gray(level.toUpperCase());
	}
};

export const logger: Logger = createLogger({
	level: "silly",
	format: format.combine(
		format.timestamp({ format: "DD.MM.YYYY HH:mm:ss" }),
		format.printf(({ timestamp, level, message }) => {
			const coloredLevel = colorizeLevel(level as LogLevel);
			return `${chalk.green(`[${timestamp}]`)} ${coloredLevel}: ${message}`;
		}),
	),
	transports: [new transports.Console()],
});

const safeStringify = (value: unknown): string => {
	return JSON.stringify(
		value,
		(_key, val) => {
			if (typeof val === "bigint") {
				return `${val.toString()}n`;
			}
			return val;
		},
		2,
	);
};

export const log = (level: LogLevel, ...args: unknown[]) => {
	const message = args
		.map((a) => (typeof a === "object" ? safeStringify(a) : String(a)))
		.join(" ");

	logger.log(level, message);
};
