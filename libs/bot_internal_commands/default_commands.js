/**
 * @param {string[]} input
 * @returns {string}
 */
export async function eval_command(input) {
	if (input.length == 0) {
		return "wtf should i eval?";
	}
	
	var result = eval(input.join(" "));
	var response = String(result);
	try {
		response = JSON.stringify(result, null, "\t");
	} catch (e) {}

	return response;
}
