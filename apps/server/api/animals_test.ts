import { get_cat, get_dog, get_fox } from "./animals.ts";
import { assert } from "https://deno.land/std@0.173.0/testing/asserts.ts";
import { download_to_tmp_file } from "./download.ts";

Deno.test("get_fox", async (t) => {
	let fox: string;
	await t.step("request fox", async () => {
		fox = await get_fox();
		console.log(fox);
		assert(fox);
	});

	let fox_file: string;
	await t.step("download fox", async () => {
		fox_file = await download_to_tmp_file(fox);
		console.log(fox_file);
		assert(fox_file);
	});
});

Deno.test("get_cat", async (t) => {
	let cat: string;
	await t.step("request cat", async () => {
		cat = await get_cat();
		console.log(cat);
		assert(cat);
	});

	let cat_file: string;
	await t.step("download cat", async () => {
		cat_file = await download_to_tmp_file(cat);
		console.log(cat_file);
		assert(cat_file);
	});
});

Deno.test("get_dog", async (t) => {
	let dog: string;
	await t.step("request dog", async () => {
		dog = await get_dog();
		console.log(dog);
		assert(dog);
	});

	let dog_file: string;
	await t.step("download dog", async () => {
		dog_file = await download_to_tmp_file(dog);
		console.log(dog_file);
		assert(dog_file);
	});
});
