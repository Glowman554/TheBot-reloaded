import { logger } from "./mod.ts";

export enum ErrorMode {
	ERROR_JSON,
	ERROR_TXT,
}

export interface Route {
	path: string;
	handler: (req: Request) => Promise<Response>;
	method: string;
}

export class Router {
	routes: Route[];
	error_mode: ErrorMode;

	constructor(error_mode = ErrorMode.ERROR_TXT) {
		this.routes = [];
		this.error_mode = error_mode;
	}

	add(path: string, handler: (req: Request) => Promise<Response>, method: string) {
		logger.logger("Adding route " + method + " " + path);
		this.routes.push({
			path: path,
			handler: handler,
			method: method,
		});
	}

	async handle(req: Request) {
		for (let route of this.routes) {
			if (req.method == route.method && new URL(req.url).pathname == route.path) {
				try {
					return await route.handler(req);
				} catch (e) {
					var error = "Error processing request: " + e;

					switch (this.error_mode) {
						case ErrorMode.ERROR_JSON:
							return new Response(
								JSON.stringify({
									error: error,
								}),
								{ status: 500 },
							);
						case ErrorMode.ERROR_TXT:
							return new Response(error, { status: 500 });
					}
				}
			}
		}
		return new Response(null, { status: 404 });
	}
}

export function create(error_mode = ErrorMode.ERROR_TXT): {
	reqHandler(req: Request): Promise<Response>;
	router: Router;
} {
	var router = new Router(error_mode);

	return {
		reqHandler: async (req: Request) => {
			var url = new URL(req.url);
			logger.logger(req.method + " " + url.pathname);

			return router.handle(req);
		},
		router: router,
	};
}
