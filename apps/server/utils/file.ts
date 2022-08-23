export function get_file_extension(file: string): string {
	return file.split(".").pop() || "";
}
