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
		console.log("Adding route " + method + " " + path);
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
