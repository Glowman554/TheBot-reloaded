export interface DiscordSlashCommands {
	id: string;
	application_id: string;
	version: string;
	default_permission: boolean;
	default_member_permissions: null;
	type: number;
	name: string;
	description: string;
	dm_permission: boolean;
	options?: Option[];
}

export interface Option {
	type: number;
	name: string;
	description: string;
	required?: boolean;
	choices?: Choice[];
}

export interface Choice {
	name: string;
	value: string;
}

export interface RateLimit {
	global: boolean;
	message: string;
	retry_after: number;
}

async function main() {
	var client_id = Deno.args[0];
	var token = Deno.args[1];

	var commands = await (await fetch(`https://discord.com/api/v10/applications/${client_id}/commands`, {
		headers: {
			"Authorization": "Bot " + token,
		},
	})).json() as DiscordSlashCommands[];

	commands.forEach(async (command) => {
		console.log("Deleting " + command.name);

        while (true) {
            var res = await (await fetch(`https://discord.com/api/v10/applications/${client_id}/commands/${command.id}`, {
                headers: {
                    "Authorization": "Bot " + token,
                },
                method: "DELETE",
            })).text();

            try {
                var rate = JSON.parse(res) as RateLimit;
                console.log("Waiting " + rate.retry_after + "s");
                await new Promise((res) => setTimeout(res, rate.retry_after * 1000));
            } catch (e) {
                console.log(res);
                break;
            }
        }
	});
}

main();
