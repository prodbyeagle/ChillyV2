import { config } from 'config/config';

/**
 * Logs the provided message with color-coded log levels.
 *
 * If `level` is 'info' and debugging is disabled, the message is not logged.
 *
 * @param message - The message to log.
 * @param level - The log level: 'info', 'warn', or 'error'.
 */
export const logMessage = (
	message: string,
	level: 'info' | 'warn' | 'error' = 'info'
): void => {
	if (level === 'info' && !config.dev) return;
	console[level](`${level.toUpperCase()}: ${message}`);
};

/**
 * Formats Large Numbers into readable numbers.
 * Recommended for Balance or ExperiencePoints.
 *
 * @param number - The number to format.
 * @returns The formatted number as a string with the appropriate unit.
 */
export function formatLargeNumber(number: number): string {
	const units: string[] = [
		'',
		'k',
		'M',
		'B',
		'T',
		'Qa',
		'Qt',
		'Sx',
		'Sp',
		'Oc',
		'No',
	];
	let unitIndex = 0;
	let formattedNumber = number;

	while (formattedNumber >= 1000 && unitIndex < units.length - 1) {
		formattedNumber /= 1000;
		unitIndex++;
	}

	const formattedString =
		formattedNumber % 1 === 0
			? `${formattedNumber.toFixed(0)}`
			: `${formattedNumber.toFixed(1)}`;

	return `${formattedString}${units[unitIndex]}`;
}

/**
 * Formats a Date object into a string with the format YYYY-MM-DD HH:MM:SS.
 *
 * @param date - The Date object to format.
 * @returns The formatted date string.
 */
export function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
