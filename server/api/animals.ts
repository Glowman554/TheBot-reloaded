export async function get_fox(): Promise<string> {
	var fox = await (await fetch("https://randomfox.ca/floof/?ref=apilist.fun")).json() as {
		image: string;
		link: string;
	};

	return fox.image;
}