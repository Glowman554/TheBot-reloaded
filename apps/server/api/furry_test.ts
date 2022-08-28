import { FurryApi } from "./furry.ts";

Deno.test("furry", async (t) => {
	var api = new FurryApi();
	for (let i of api._methods) {
		await t.step(i, async () => {
			var res = await api.methods[i]();
			console.log(res);
		});
	}
});
