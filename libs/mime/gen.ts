// Generated by https://quicktype.io

export interface MIMEDB {
	source?:       Source;
	charset?:      Charset;
	compressible?: boolean;
	extensions?:   string[];
}

export enum Charset {
	The7Bit = "7-BIT",
	UTF8 = "UTF-8",
	UsASCII = "US-ASCII",
}

export enum Source {
	Apache = "apache",
	IANA = "iana",
	Nginx = "nginx",
}


var mime = await (await fetch("https://raw.githubusercontent.com/jshttp/mime-db/master/db.json")).json() as { [key: string]: MIMEDB };

var file = "";

function emit_line(line: string) {
	file += line + "\n";
}

emit_line(`#include <mime.h>`);
emit_line(`\nstd::string mime(std::string const& input) {`);

for (let i in mime) {
	let m = mime[i];

	if (!m.extensions) {
		continue;
	}

	for (let e of m.extensions) {
		emit_line(`\tif (input == "${e}") return "${i}";`)
	}
}

emit_line(`\treturn "unk";`);
emit_line(`}`);


Deno.writeTextFileSync("mime.cpp", file);