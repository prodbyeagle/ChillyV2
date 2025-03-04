import { Events, REST, Routes } from 'discord.js';
import { config } from '../config/config';
import { ChillyRPGClient } from '../client';
import { startCommand } from '../commands/start';
import { inventoryCommand } from '../commands/inventory';
import { giveItemCommand } from '../commands/admin/giveItem';
import { profileCommand } from '../commands/profile';
import { clickerCommand } from '../commands/games/clicker';

/**
 * Logs the provided message with a timestamp.
 */
export const logMessage = (
	message: string,
	level: 'info' | 'warn' | 'error' = 'info'
) => {
	console[level](`${level.toUpperCase()}: ${message}`);
};

export const readyEvent = (client: ChillyRPGClient) => {
	client.on(Events.ClientReady, async () => {
		if (client.user) {
			logMessage(`Logged in as ${client.user.tag}`, 'info');
			const rest = new REST({ version: '10' }).setToken(config.token);

			const commands = new Map();
			commands.set(startCommand.name, startCommand);
			commands.set(inventoryCommand.name, inventoryCommand);
			commands.set(giveItemCommand.name, giveItemCommand);
			commands.set(profileCommand.name, profileCommand);
			commands.set(clickerCommand.name, clickerCommand)

			client.commands.set(startCommand.name, startCommand);
			client.commands.set(inventoryCommand.name, inventoryCommand);
			client.commands.set(giveItemCommand.name, giveItemCommand);
			client.commands.set(profileCommand.name, profileCommand);
			client.commands.set(clickerCommand.name, clickerCommand);

			try {
				logMessage(
					'Started refreshing application (/) commands.',
					'info'
				);

				await rest.put(Routes.applicationCommands(client.user.id), {
					body: Array.from(commands.values()).map((command) =>
						command.data.toJSON()
					),
				});

				logMessage(
					'Successfully reloaded application (/) commands.',
					'info'
				);
			} catch (error) {
				logMessage(
					`Error while refreshing commands: ${error}`,
					'error'
				);
			}
		} else {
			logMessage('Client user is undefined. Unable to log in.', 'warn');
		}
	});
};
