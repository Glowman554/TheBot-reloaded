import { log } from "../logger.ts";
import { supabaseClient, supabaseTable } from "https://deno.land/x/supabase_deno@v1.0.5/mod.ts";


export interface MikkiAccount {
	username: string;
	password_hash: string;
	editor: boolean;
	token: string
};

export interface MikkiChange {
	when: number;
	what: string;
};

export interface MikkiPage {
	id: string;
	text: string;
	meta: {
		page_created: number;
		page_edited: number;
		page_title: string
	};
};

export class MikkiClient {
	sb_url: string;
	sb_token: string;

	client: supabaseClient;

	accounts_table: supabaseTable;
	changelog_table: supabaseTable;
	pages_table: supabaseTable;

	constructor(sb_url: string, sb_token: string) {
		log("mikki", "url: " + sb_url);

		this.sb_url = sb_url;
		this.sb_token = sb_token;

		this.client = new supabaseClient(this.sb_url, this.sb_token);

		this.accounts_table = this.client.tables().get("mikki_accounts");
		this.changelog_table = this.client.tables().get("mikki_changes");
		this.pages_table = this.client.tables().get("mikki_pages");

		// this.accounts().then(accounts => accounts.forEach(a => {
		// 	a.editor = true;
		// 	this.account_update(a);
		// 	this.account(a.username).then(console.log);
		// }));

		// this.changes().then(console.log);

		log("TODO", "implement pages api");
	}

	async accounts(): Promise<MikkiAccount[]> {
		return this.accounts_table.items().all() as Promise<MikkiAccount[]>;
	}

	async account(username: string): Promise<MikkiAccount|undefined> {
		return (await this.accounts_table.items().get("username", username))[0] as MikkiAccount|undefined;
	}

	async account_update(account: MikkiAccount) {
		await this.accounts_table.items().edit("username", account.username, account);
	}

	async changes(): Promise<MikkiChange[]> {
		function compare(a: MikkiChange, b: MikkiChange) {
			if (a.when < b.when) {
				return -1;
			}
			if (a.when > b.when) {
				return 1;
			}
			return 0;
		}

		return ((await this.changelog_table.items().all()) as MikkiChange[]).sort(compare);
	}
}

export var mikki: MikkiClient;

export function init_mikki_api(sb_url: string, sb_token: string) {
	log("mikki", "Initializing mikki api...");
	mikki = new MikkiClient(sb_url, sb_token);
}
