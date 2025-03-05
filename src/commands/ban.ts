import {
	ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandBuilder,
	EmbedBuilder,
} from 'discord.js';
import type { ICommand, IPlayerData } from 'types';
import { Api } from 'config/api';
import { branding } from 'config/config';

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
			const embed = new EmbedBuilder()
				.setTitle('❌ User Not Found')
				.setDescription('The specified user could not be found.')
				.setColor(branding.AccentColor)
				.setTimestamp();

			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		try {
			const playerData: IPlayerData | null = await Api.getPlayer(
				targetUser.username
			);

			if (!playerData) {
				const embed = new EmbedBuilder()
					.setTitle('❌ Player Not Found')
					.setDescription(`Player ${targetUser.username} not found.`)
					.setColor(branding.AccentColor)
					.setTimestamp();

				await interaction.reply({
					embeds: [embed],
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

			const embed = new EmbedBuilder().setTimestamp();

			if (success) {
				embed
					.setTitle('✅ Ban Successful')
					.setDescription(
						`Successfully banned ${targetUser.username} for: ${banReason}`
					)
					.setColor(branding.AccentColor);
			} else {
				embed
					.setTitle('❌ Ban Failed')
					.setDescription('Failed to ban the user.')
					.setColor(branding.AccentColor);
			}

			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
		} catch (error) {
			const embed = new EmbedBuilder()
				.setTitle('❌ Error')
				.setDescription(`Error banning user: ${error.message}`)
				.setColor(branding.AccentColor)
				.setTimestamp();

			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
