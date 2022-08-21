import { get_fox, get_cat, get_dog } from "./animals.ts";
import { assert } from "https://deno.land/std@0.152.0/testing/asserts.ts";
import { download_to_tmp_file } from "./download.ts";


Deno.test("get_fox", async (t) => {
	var fox: string;
	await t.step("request fox", async () => {
		fox = await get_fox();
		console.log(fox);
		assert(fox);
	});

	var fox_file: string;
	await t.step("download fox", async () => {
		fox_file = await download_to_tmp_file(fox);
		console.log(fox_file);
		assert(fox_file);
	});
});

Deno.test("get_cat", async (t) => {
	var cat: string;
	await t.step("request cat", async () => {
		cat = await get_cat();
		console.log(cat);
		assert(cat);
	});

	var cat_file: string;
	await t.step("download cat", async () => {
		cat_file = await download_to_tmp_file(cat);
		console.log(cat_file);
		assert(cat_file);
	});
});

Deno.test("get_dog", async (t) => {
	var dog: string;
	await t.step("request dog", async () => {
		dog = await get_dog();
		console.log(dog);
		assert(dog);
	});

	var dog_file: string;
	await t.step("download dog", async () => {
		dog_file = await download_to_tmp_file(dog);
		console.log(dog_file);
		assert(dog_file);
	});
});