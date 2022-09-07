export interface Anofile {
	status: boolean;
	data: {
		file: {
			url: {
				full: string;
				short: string;
			};
			metadata: {
				id: string;
				name: string;
			};
		};
	};
}

export async function anofile_upload(file: string) {
	let f = new File([Deno.readFileSync(file)], String(file.split("/").pop()));

	let form = new FormData();
	form.append("file", f);

	return await (await fetch("https://api.anonfiles.com/upload", {
		method: "POST",
		body: form,
	})).json() as Anofile;
}

export async function anofile_upload_s(data: string, file: string) {
	let f = new File([data], file);

	let form = new FormData();
	form.append("file", f);

	return await (await fetch("https://api.anonfiles.com/upload", {
		method: "POST",
		body: form,
	})).json() as Anofile;
}
