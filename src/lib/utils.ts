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
) => {
	if (level === 'info' && !config.dev) return;
	console[level](`${level.toUpperCase()}: ${message}`);
};

/**
 * Formats Large Numbers into readable numbers.
 * Recommended for Balance or ExperiencePoints.
 *
 * @param number - The number to format.
 */
export function formatLargeNumber(number: number): string {
	const units = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qt', 'Sx', 'Sp', 'Oc', 'No'];
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
