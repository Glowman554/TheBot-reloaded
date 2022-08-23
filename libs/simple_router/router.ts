import { logger } from "./mod.ts";

export interface Route {
	path: string;
	handler: (req: Request) => Promise<Response>;
	method: string;
}

export class Router {
	routes: Route[];

	constructor() {
		this.routes = [];
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
				return await route.handler(req);
			}
		}
		return new Response(null, { status: 404 });
	}
}

export function create(): {
	reqHandler(req: Request): Promise<Response>;
	router: Router;
} {
	var router = new Router();

	return {
		reqHandler: async (req: Request) => {
			var url = new URL(req.url);
			logger.logger(req.method + " " + url.pathname);

			return router.handle(req);
		},
		router: router,
	};
}
