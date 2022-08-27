import { supabaseClient, supabaseTable } from "https://deno.land/x/supabase_deno@v1.0.5/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.2.4/mod.ts";

export interface MikkiAccount {
	username: string;
	password_hash: string;
	editor: boolean;
	token: string;
}

export interface MikkiChange {
	when: number;
	what: string;
}

export interface MikkiPage {
	id: string;
	text: string;
	meta: {
		page_created: number;
		page_edited: number;
		page_title: string;
	};
}

export interface MikkiAccountOptions {
	username: string;
	password: string;
}

export class MikkiClient {
	private sb_url: string;
	private sb_token: string;

	private client: supabaseClient;

	private accounts_table: supabaseTable;
	private changelog_table: supabaseTable;
	private pages_table: supabaseTable;

	constructor(sb_url: string, sb_token: string) {
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
	}

	private create_account_token() {
		let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		// Pick characers randomly
		let str = "";
		for (let i = 0; i < 20; i++) {
			str += chars.charAt(Math.floor(Math.random() * chars.length));
		}

		return str;
	}

	async accounts(): Promise<MikkiAccount[]> {
		return this.accounts_table.items().all() as Promise<MikkiAccount[]>;
	}

	async account(username: string): Promise<MikkiAccount | undefined> {
		return (await this.accounts_table.items().get("username", username))[0] as MikkiAccount | undefined;
	}

	async account_update(account: MikkiAccount) {
		await this.accounts_table.items().edit("username", account.username, account);
	}

	async account_delete(username: string) {
		await this.accounts_table.items().delete("username", username);
	}

	async account_create(opt: MikkiAccountOptions) {
		var account: MikkiAccount = {
			editor: false,
			username: opt.username,
			password_hash: bcrypt.hashSync(opt.password),
			token: this.create_account_token(),
		};

		if (await this.account(account.username)) {
			throw new Error("Already exists!");
		}

		await this.accounts_table.items().add(account);

		return account;
	}

	async account_get_token(token: string) {
		return (await this.accounts_table.items().get("token", token))[0] as MikkiAccount | undefined;
	}

	async account_check(opt: MikkiAccountOptions) {
		var account = await this.account(opt.username);
		if (!account) {
			throw new Error("Invalid username!");
		}

		if (!bcrypt.compareSync(opt.password, account.password_hash)) {
			throw new Error("Invalid password!");
		}

		return account;
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
