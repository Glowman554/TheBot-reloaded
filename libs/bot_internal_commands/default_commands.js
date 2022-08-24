/**
 * @param {string[]} input
 * @returns {string}
 */
export async function eval_command(input) {
	var result = eval(input.join(" "));
	var response = String(result);
	try {
		response = JSON.stringify(response, null, "\t");
	} catch (e) {}

	return response;
}
