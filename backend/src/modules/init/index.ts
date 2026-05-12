import { checkConfig } from "./config.check";

export const INIT_SERVER = async () => {
	await checkConfig();
};
