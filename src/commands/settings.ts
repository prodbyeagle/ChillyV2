import { Api } from 'config/api';
import { branding } from 'config/config';

import type { ICommand, IPlayerData } from 'types';

import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';

export const settingsCommand: ICommand = {
	name: 'settings',
	description: 'Configure your account settings.',
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Manage your account settings.')
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

	execute: async (interaction: ChatInputCommandInteraction) => {
		const user = interaction.user;
		const playerData = await Api.getPlayerByID(user.id);

		if (!playerData) {
			await interaction.reply({
				content: '❌ You are not registered in the system.',
				flags: 'Ephemeral',
			});
			return;
		}

		const getSettingsEmbed = (data: IPlayerData) =>
			new EmbedBuilder()
				.setColor(branding.AccentColor)
				.setTitle('⚙️ Account Settings')
				.setDescription(
					'Toggle your settings below or delete your account.'
				)
				.addFields([
					{
						name: '🏆 Achievement Notifications',
						value: data.achievementnotification
							? '✅ Enabled'
							: '❌ Disabled',
						inline: true,
					},
					{
						name: '🕵️‍♂️ Robbery Enabled',
						value: data.robberyenabled
							? '✅ Enabled'
							: '❌ Disabled',
						inline: true,
					},
					{
						name: '📈 Level Up Notifications',
						value: data.levelupnotification
							? '✅ Enabled'
							: '❌ Disabled',
						inline: true,
					},
				]);

		const getButtons = () =>
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId('toggle_achievement')
					.setLabel('Toggle Achievements')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('toggle_robbery')
					.setLabel('Toggle Robbery')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('toggle_levelup')
					.setLabel('Toggle Level Up')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('delete_account')
					.setLabel('❌ Delete Account')
					.setStyle(ButtonStyle.Danger)
			);

		const message = await interaction.reply({
			embeds: [getSettingsEmbed(playerData)],
			components: [getButtons()],
			flags: 'Ephemeral',
		});

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 900000,
		});

		collector.on('collect', async (i) => {
			if (i.user.id !== user.id) {
				await i.reply({
					content: "You can't change these settings.",
					flags: 'Ephemeral',
				});
				return;
			}

			if (i.customId === 'delete_account') {
				await Api.deletePlayer(user.username);
				await i.update({
					embeds: [
						new EmbedBuilder()
							.setColor(branding.AccentColor)
							.setTitle('✅ Account Deleted')
							.setDescription('Your data has been removed.'),
					],
					components: [],
				});
				collector.stop();
				return;
			}

			let updatedData = {};

			switch (i.customId) {
				case 'toggle_achievement':
					updatedData = {
						achievementnotification:
							!playerData.achievementnotification,
					};
					break;
				case 'toggle_robbery':
					updatedData = {
						robberyenabled: !playerData.robberyenabled,
					};
					break;
				case 'toggle_levelup':
					updatedData = {
						levelupnotification: !playerData.levelupnotification,
					};
					break;
			}

			const success = await Api.updatePlayer(
				user.username,
				user.id,
				updatedData
			);
			if (success) {
				Object.assign(playerData, updatedData);
				await i.update({
					embeds: [getSettingsEmbed(playerData)],
					components: [getButtons()],
				});
			} else {
				await i.reply({
					content: '❌ Update failed. Try again later.',
					flags: 'Ephemeral',
				});
			}
		});

		collector.on('end', async () => {
			await message.edit({ components: [] }).catch(() => null);
		});
	},
};
