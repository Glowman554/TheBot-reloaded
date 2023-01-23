import { FurryApi } from "./furry.ts";

Deno.test("furry", async (t) => {
	const api = new FurryApi();
	for (const i of api._methods) {
		await t.step(i, async () => {
			const res = await api.methods[i]();
			console.log(res);
		});
	}
});
