export let logger: { logger(msg: string): void } = {
	logger: (msg) => {},
};

export function set_logger(l: { logger(msg: string): void }) {
	logger = l;
}

export type { Route } from "./router.ts";
export { create, ErrorMode, Router } from "./router.ts";
