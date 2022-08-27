import { MikkiAccountOptions, MikkiClient, MikkiPage } from "./mod.ts";

var SB_URL = Deno.env.get("SB_URL");
if (!SB_URL) {
	SB_URL = Deno.args[0];
}

var SB_TOKEN = Deno.env.get("SB_TOKEN");
if (!SB_TOKEN) {
	SB_TOKEN = Deno.args[1];
}

console.log(SB_URL, SB_TOKEN);

Deno.test("accounts", async (t) => {
	var client = new MikkiClient(SB_URL as string, SB_TOKEN as string);

	var test_account: MikkiAccountOptions = {
		password: "test123",
		username: "test",
	};

	await t.step("create account", async () => {
		console.log(await client.account_create(test_account));
	});

	await t.step("check account", async () => {
		console.log(await client.account_check(test_account));
	});

	await t.step("delete account", async () => {
		await client.account_delete(test_account.username);
	});
});

Deno.test("pages", async (t) => {
	var client = new MikkiClient(SB_URL as string, SB_TOKEN as string);
	
	var page: MikkiPage;
	await t.step("create", async () => {
		page = await client.page_create("test123", "hewwo");
		console.log(page)
	})

	await t.step("delete", async () => {
		await client.page_delete(page.id);
	})
})
