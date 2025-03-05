import { EmbedBuilder, Events, MessageFlags } from 'discord.js';
import { logMessage } from 'lib/utils';
import { ChillyClient } from 'client';
import { Api } from 'config/api';
import { branding } from 'config/config';

/**
 * Checks if a user is banned and sends an appropriate error message.
 * @param userId - The ID of the user to check.
 * @returns A boolean indicating whether the user is banned.
 */
const isUserBanned = async (userId: string): Promise<boolean> => {
	try {
		const userData = await Api.getPlayerByID(userId);
		if (!userData) {
			return false;
		}
		return userData.isbanned;
	} catch (error) {
		logMessage(
			`Error checking ban status for user ${userId}: ${error.message}`,
			'error'
		);
		return false;
	}
};

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

		const userBanned = await isUserBanned(interaction.user.id);
		if (userBanned) {
			const bannedEmbed = new EmbedBuilder()
				.setTitle('❌ Banned')
				.setDescription('You are banned from using commands!')
				.setColor(branding.AccentColor)
				.setTimestamp();

			await interaction.reply({
				embeds: [bannedEmbed],
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			logMessage(
				`Error executing command ${interaction.commandName}: ${error.message}`,
				'error'
			);

			const errorEmbed = new EmbedBuilder()
				.setTitle('❌ Command Error')
				.setDescription('There was an error executing this command!')
				.setColor(branding.AccentColor)
				.setTimestamp();

			try {
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({
						embeds: [errorEmbed],
						flags: MessageFlags.Ephemeral,
					});
				} else {
					await interaction.reply({
						embeds: [errorEmbed],
						flags: MessageFlags.Ephemeral,
					});
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
