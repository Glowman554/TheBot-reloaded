fetch("http://localhost:3566/compiler/run", {
	body: "ls",
	method: "POST",
}).then((res) => res.json().then((res) => console.log(res.stdout)));
