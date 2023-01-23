export async function get_fox(): Promise<string> {
	const fox = await (await fetch("https://randomfox.ca/floof/?ref=apilist.fun")).json() as {
		image: string;
		link: string;
	};

	return fox.image;
}

export async function get_dog(): Promise<string> {
	const dog = await (await fetch("https://dog.ceo/api/breeds/image/random")).json() as {
		message: string;
		status: string;
	};

	return dog.message;
}

export async function get_cat(): Promise<string> {
	const cat = await (await fetch("https://api.thecatapi.com/v1/images/search")).json() as {
		id: string;
		url: string;
		width: number;
		height: number;
	}[];

	return cat[0].url;
}
