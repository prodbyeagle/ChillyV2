import {
	ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandBuilder,
} from 'discord.js';
import { ICommand, IPlayerData } from 'types';
import { Api } from 'config/api';

export const banCommand: ICommand = {
	name: 'ban',
	description: 'Bans a user, setting their isbanned status to true.',
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans a user.')
		.addUserOption((option) =>
			option
				.setName('username')
				.setDescription('The player to ban')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('banreason')
				.setDescription('The reason for the ban')
				.setRequired(false)
		),
	execute: async (interaction: ChatInputCommandInteraction) => {
		const targetUser = interaction.options.getUser('username');
		const banReason =
			interaction.options.getString('banreason') || 'No reason provided';

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

			updatedData.isbanned = true;
			updatedData.banreason = banReason;

			const success = await Api.updatePlayer(
				targetUser.username,
				targetUser.id,
				updatedData
			);

			if (success) {
				await interaction.reply({
					content: `Successfully banned ${targetUser.username} for: ${banReason}`,
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					content: 'Failed to ban the user.',
					flags: MessageFlags.Ephemeral,
				});
			}
		} catch (error) {
			await interaction.reply({
				content: `Error banning user: ${error.message}`,
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
