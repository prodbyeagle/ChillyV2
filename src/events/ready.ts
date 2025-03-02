import { Events, REST, Routes } from 'discord.js';
import { config } from '@/config/config';
import { EagleClient } from '@/client';

import { startCommand } from '@/commands/start';
import { inventoryCommand } from '@/commands/inventory';

/**
 * Logs the provided message with a timestamp.
 */
export const logMessage = (
	message: string,
	level: 'info' | 'warn' | 'error' = 'info'
) => {
	console[level](`${level.toUpperCase()}: ${message}`);
};

export const readyEvent = (client: EagleClient) => {
	client.on(Events.ClientReady, async () => {
		if (client.user) {
			logMessage(`Logged in as ${client.user.tag}`, 'info');
			const rest = new REST({ version: '10' }).setToken(config.token);
			const commands = [startCommand];

			client.commands.set(startCommand.name, startCommand);
			client.commands.set(inventoryCommand.name, inventoryCommand);

			try {
				logMessage(
					'Started refreshing application (/) commands.',
					'info'
				);

				rest.put(Routes.applicationCommands(client.user.id), {
					body: commands.map((command) => ({
						name: command.name,
						description: command.description,
					})),
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
