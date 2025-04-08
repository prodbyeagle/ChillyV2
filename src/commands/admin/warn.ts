import { Api } from 'config/api';
import { branding } from 'config/config';

import type { ICommand } from 'types';

import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';

export const warnCommand: ICommand = {
	name: 'warn',
	description: 'Warns a user.',
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Warn a user')
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('The user to warn')
				.setRequired(true)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	execute: async (interaction: ChatInputCommandInteraction) => {
		const user = interaction.options.getUser('user');

		if (!user) {
			const embed = new EmbedBuilder()
				.setColor(branding.AccentColor)
				.setTitle('❌ Error')
				.setDescription('User not found!');
			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		if (user.bot) {
			const embed = new EmbedBuilder()
				.setColor(branding.AccentColor)
				.setTitle('❌ Error')
				.setDescription('Bots cannot be warned!');
			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		try {
			const playerData = await Api.getPlayerByID(user.id);

			if (!playerData) {
				const embed = new EmbedBuilder()
					.setColor(branding.AccentColor)
					.setTitle('⚠️ User Not Registered')
					.setDescription(`${user.username} is not registered.`);
				await interaction.reply({
					embeds: [embed],
					flags: MessageFlags.Ephemeral,
				});
				return;
			}

			if (playerData.isbanned) {
				const embed = new EmbedBuilder()
					.setColor(branding.AccentColor)
					.setTitle('⚠️ Warning')
					.setDescription('The player is already banned!');
				await interaction.reply({
					embeds: [embed],
					flags: MessageFlags.Ephemeral,
				});
				return;
			}

			playerData.warningcount = (playerData.warningcount || 0) + 1;

			const success = await Api.updatePlayer(
				user.username,
				user.id,
				playerData
			);

			const embed = new EmbedBuilder()
				.setColor(branding.AccentColor)
				.setTimestamp();

			if (success) {
				embed
					.setTitle('⚠️ Warning Issued')
					.setDescription(`${user.username} has been warned!`)
					.addFields([
						{
							name: 'Warnings',
							value: playerData.warningcount.toString(),
						},
					]);
			} else {
				embed
					.setTitle('❌ Error')
					.setDescription('Failed to issue a warning.');
			}

			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
		} catch (error) {
			const embed = new EmbedBuilder()
				.setColor(branding.AccentColor)
				.setTitle('❌ An Error Occurred')
				.setDescription(
					`An error occurred while trying to warn the user: ${error.message}`
				);
			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
