export function dateToString(date: number) {
	const date_obj = new Date(date);
	const options: Intl.DateTimeFormatOptions = {
		weekday: 'long',
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	};
	return date_obj.toLocaleDateString('de-DE', options);
}