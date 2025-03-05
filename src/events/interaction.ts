import { Events, MessageFlags } from 'discord.js';
import { logMessage } from 'lib/utils';
import { ChillyClient } from 'client';

/**
 * Handles the `InteractionCreate` event.
 * This event is triggered when an interaction (such as a command or autocomplete) is created.
 *
 * It processes both autocomplete interactions and chat input commands,
 * executing the associated command if available, and handling errors gracefully.
 *
 * @param client - The ChillyClient instance that emits this event.
 */
export const interactionCreateEvent = (client: ChillyClient) => {
	client.on(Events.InteractionCreate, async (interaction) => {
		if (!interaction) {
			logMessage('Received an undefined or null interaction.', 'error');
			return;
		}

		if (interaction.isAutocomplete()) {
			const command = client.commands.get(interaction.commandName);

			if (command?.autocomplete) {
				try {
					await command.autocomplete(interaction);
					logMessage(
						`Successfully handled autocomplete for ${interaction.commandName}`,
						'info'
					);
				} catch (error) {
					logMessage(
						`Error handling autocomplete for ${interaction.commandName}: ${error.message}`,
						'error'
					);
				}
			}
			return;
		}

		if (!interaction.isChatInputCommand()) return;

		const command = client.commands.get(interaction.commandName);

		if (!command) {
			logMessage(`Unknown command: ${interaction.commandName}`, 'warn');
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			logMessage(
				`Error executing command ${interaction.commandName}: ${error.message}`,
				'error'
			);

			const errorMessage = {
				content: 'There was an error executing this command!',
				flags: MessageFlags.Ephemeral as const,
			};

			try {
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp(errorMessage);
				} else {
					await interaction.reply(errorMessage);
				}
			} catch (replyError) {
				logMessage(
					`Error sending error message for ${interaction.commandName}: ${replyError.message}`,
					'error'
				);
			}
		}
	});
};
