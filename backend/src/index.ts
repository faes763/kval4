import { Elysia } from "elysia";
import { config } from "./common/config";
import { log } from "./common/log/logger";
import { INIT_SERVER } from "./modules/init";
import { routers } from "./modules/routers";

const app = new Elysia().decorate("logger", log).decorate("config", config);

const main = async () => {
	await INIT_SERVER();

	const api = await routers();

	app.use(api);

	await app.listen({
		port: Number(config.port),
		hostname: "0.0.0.0",
	});

	log("info", `Server is running on port ${config.port}`);
};

main();
