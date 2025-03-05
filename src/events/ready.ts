import { Events, REST, Routes } from 'discord.js';
import { config } from 'config/config';
import { ChillyClient } from 'client';
import { profileCommand } from 'commands/user/profile';
import { eventCommand } from 'commands/event';
import { robCommand } from 'commands/games/rob';
import { leaderboardCommand } from 'commands/user/leaderboard';

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
 * Handles the `ClientReady` event.
 * This event is triggered when the bot has successfully logged in and is ready to use.
 * It registers all the bot commands with Discord and logs the status.
 *
 * @param client - The ChillyClient instance that emits this event.
 */
export const readyEvent = (client: ChillyClient) => {
	client.on(Events.ClientReady, async () => {
		if (client.user) {
			const rest = new REST({ version: '10' }).setToken(config.token);

			const commands = new Map();
			commands.set(profileCommand.name, profileCommand);
			commands.set(eventCommand.name, eventCommand);
			commands.set(robCommand.name, robCommand);
			commands.set(leaderboardCommand.name, leaderboardCommand);
			client.commands.set(profileCommand.name, profileCommand);
			client.commands.set(eventCommand.name, eventCommand);
			client.commands.set(robCommand.name, robCommand);
			client.commands.set(leaderboardCommand.name, leaderboardCommand);

			try {
				await rest.put(Routes.applicationCommands(client.user.id), {
					body: Array.from(commands.values()).map((command) =>
						command.data.toJSON()
					),
				});
			} catch (error) {
				logMessage(
					`Error while refreshing commands: ${error.message}`,
					'error'
				);
			}
		} else {
			logMessage('Client user is undefined. Unable to log in.', 'warn');
		}
	});
};
