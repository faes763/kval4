import { getConfigValue } from "./get.config";


export const config = {
	port: getConfigValue("PORT"),

	node_process: getConfigValue("NODE_ENV"),


	services: {
		database: {
			url: getConfigValue("DATABASE_URL"),
		},
	},

	cors: {
		origin: "*",
	},
};

export type Config = typeof config;
