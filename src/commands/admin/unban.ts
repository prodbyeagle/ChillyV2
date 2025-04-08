import { Api } from 'config/api';
import { branding } from 'config/config';

import type { ICommand, IPlayerData } from 'types';

import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';

export const unbanCommand: ICommand = {
	name: 'unban',
	description: 'Unbans a user, setting their isbanned status to false.',
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Unbans a user.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addUserOption((option) =>
			option
				.setName('username')
				.setDescription('The player to unban')
				.setRequired(true)
		),
	execute: async (interaction: ChatInputCommandInteraction) => {
		const targetUser = interaction.options.getUser('username');

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
			const { userid, ...updatedData } = playerData;

			updatedData.isbanned = false;
			updatedData.banreason = '';

			const success = await Api.updatePlayer(
				targetUser.username,
				targetUser.id,
				updatedData
			);

			const embed = new EmbedBuilder().setTimestamp();

			if (success) {
				embed
					.setTitle('✅ Unban Successful')
					.setDescription(
						`Successfully unbanned ${targetUser.username}.`
					)
					.setColor(branding.AccentColor);
			} else {
				embed
					.setTitle('❌ Unban Failed')
					.setDescription('Failed to unban the user.')
					.setColor(branding.AccentColor);
			}

			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
		} catch (error) {
			const embed = new EmbedBuilder()
				.setTitle('❌ Error')
				.setDescription(`Error unbanning user: ${error.message}`)
				.setColor(branding.AccentColor)
				.setTimestamp();

			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
