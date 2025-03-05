import {
	ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandBuilder,
} from 'discord.js';
import { ICommand, IPlayerData } from 'types';
import { Api } from 'config/api';

export const unbanCommand: ICommand = {
	name: 'unban',
	description: 'Unbans a user, setting their isbanned status to false.',
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Unbans a user.')
		.addUserOption((option) =>
			option
				.setName('username')
				.setDescription('The player to unban')
				.setRequired(true)
		),
	execute: async (interaction: ChatInputCommandInteraction) => {
		const targetUser = interaction.options.getUser('username');

		if (!targetUser) {
			await interaction.reply({
				content: 'User not found!',
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		try {
			const playerData: IPlayerData | null = await Api.getPlayer(
				targetUser.username
			);

			if (!playerData) {
				await interaction.reply({
					content: `Player ${targetUser.username} not found.`,
					flags: MessageFlags.Ephemeral,
				});
				return;
			}

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { id, ...updatedData } = playerData;

			updatedData.isbanned = false;
			updatedData.banreason = '';

			const success = await Api.updatePlayer(
				targetUser.username,
				targetUser.id,
				updatedData
			);

			if (success) {
				await interaction.reply({
					content: `Successfully unbanned ${targetUser.username}.`,
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					content: 'Failed to unban the user.',
					flags: MessageFlags.Ephemeral,
				});
			}
		} catch (error) {
			await interaction.reply({
				content: `Error unbanning user: ${error.message}`,
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
