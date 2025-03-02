import { Events } from 'discord.js';
import { logMessage } from './ready';
import { EagleClient } from '../client';

/**
 * Handles the InteractionCreate event.
 */
export const interactionCreateEvent = (client: EagleClient) => {
	client.on(Events.InteractionCreate, async (interaction) => {
		if (!interaction.isChatInputCommand()) return;

		const command = client.commands.get(interaction.commandName);

		if (!command) {
			logMessage(`Unknown command: ${interaction.commandName}`, 'warn');
			return;
		}

		try {
			await command.execute(interaction);
			logMessage(
				`Successfully executed command: ${interaction.commandName}`,
				'info'
			);
		} catch (error) {
			logMessage(
				`Error executing command ${interaction.commandName}: ${error}`,
				'error'
			);
			const errorMessage = {
				content: 'There was an error executing this command!',
				ephemeral: true,
			};
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
		}
	});
};
