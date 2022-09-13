import { MikkiClient } from "https://deno.land/x/mikki@0.13/mod.ts";
import { supabaseClient } from "https://deno.land/x/supabase_deno@v1.0.5/mod.ts";


const escape_map: { [key: string]: string } = {
	'\\\\': '\\\\',
	'"': '\\"',
	'\b': '\\b',
	'\f': '\\f',
	'\n': '\\n',
	'\t': '\\t'
};

export function process_escapes(input: string) {
	for (let escape in escape_map) {
		input = input.replace(new RegExp(escape, 'g'), escape_map[escape]);
	}
	return input;
}

var SB_URL = Deno.env.get("SB_URL");
if (!SB_URL) {
	SB_URL = Deno.args[0];
}

var SB_TOKEN = Deno.env.get("SB_TOKEN");
if (!SB_TOKEN) {
	SB_TOKEN = Deno.args[1];
}

var rollback = false;

var mikki = new MikkiClient(SB_URL, SB_TOKEN);

var mikki_raw = new supabaseClient(SB_URL, SB_TOKEN);

if (rollback) {
    for (let p of await mikki_raw.tables().get("mikki_pages2").items().all()) {
        mikki_raw.tables().get("mikki_pages").items().add(p).then(() => console.log("rollback finished for " + p.meta.page_title))
    }
} else {
    for (let p of await mikki.pages()) {
        mikki_raw.tables().get("mikki_pages2").items().add(p).then(() => console.log("write finished for " + p.meta.page_title));
    }

    for (let p of await mikki.pages()) {
        mikki.page_update(p.id, encodeURIComponent(process_escapes(p.meta.page_title).replace(/%0[aA]/g, '\n')), encodeURIComponent(process_escapes(p.text).replace(/%0[aA]/g, '\n'))).then(() => console.log("re encode finished for " + p.meta.page_title));
    }
}