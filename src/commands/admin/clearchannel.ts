import { branding, channelBlacklist } from 'config/config';

import type { ICommand } from 'types';

import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	EmbedBuilder,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextChannel,
} from 'discord.js';

export const clearChannelCommand: ICommand = {
	name: 'clearchannel',
	description: 'Clears all messages in a specified channel.',
	data: new SlashCommandBuilder()
		.setName('clearchannel')
		.setDescription('Clears all messages in the specified channel.')
		.addChannelOption((option) =>
			option
				.setName('channel')
				.setDescription('The channel to clear')
				.setRequired(true)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	execute: async (interaction: ChatInputCommandInteraction) => {
		const channel = interaction.options.getChannel('channel');

		if (!channel || !(channel instanceof TextChannel)) {
			const embed = new EmbedBuilder()
				.setColor(branding.AccentColor)
				.setTitle('❌ Error')
				.setDescription('Invalid channel selected!');
			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		if (channelBlacklist.has(channel.id)) {
			const embed = new EmbedBuilder()
				.setColor(branding.AccentColor)
				.setTitle('❌ Action Denied')
				.setDescription('This channel cannot be cleared.');
			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		const confirmEmbed = new EmbedBuilder()
			.setColor(branding.AccentColor)
			.setTitle('⚠️ Confirmation Required')
			.setDescription(
				`Are you sure you want to clear all messages in ${channel}?`
			);

		const yesButton = new ButtonBuilder()
			.setCustomId('confirm_clear')
			.setLabel('Yes')
			.setStyle(ButtonStyle.Danger)
			.setDisabled(true);

		const noButton = new ButtonBuilder()
			.setCustomId('cancel_clear')
			.setLabel('No')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			yesButton,
			noButton
		);

		const message = await interaction.reply({
			embeds: [confirmEmbed],
			components: [row],
			flags: MessageFlags.Ephemeral,
		});

		setTimeout(async () => {
			yesButton.setDisabled(false);
			await message.edit({
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						yesButton,
						noButton
					),
				],
			});
		}, 5000);

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 15000,
		});

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				await i.reply({
					content: "You can't use this confirmation.",
					flags: MessageFlags.Ephemeral,
				});
				return;
			}

			if (i.customId === 'confirm_clear') {
				try {
					let messages = await channel.messages.fetch({ limit: 100 });

					while (messages.size > 0) {
						await channel.bulkDelete(messages, true);
						messages = await channel.messages.fetch({ limit: 100 });
					}

					const successEmbed = new EmbedBuilder()
						.setColor(branding.AccentColor)
						.setTitle('✅ Channel Cleared')
						.setDescription(
							`All messages in ${channel} have been deleted.`
						);

					await interaction.editReply({
						embeds: [successEmbed],
						components: [],
					});
				} catch (error) {
					const errorEmbed = new EmbedBuilder()
						.setColor(branding.AccentColor)
						.setTitle('❌ Error')
						.setDescription(
							`Failed to clear messages: ${error.message}`
						);

					await interaction.editReply({
						embeds: [errorEmbed],
						components: [],
					});
				}
			} else if (i.customId === 'cancel_clear') {
				const cancelEmbed = new EmbedBuilder()
					.setColor(branding.AccentColor)
					.setTitle('✅ Action Cancelled')
					.setDescription('Channel clear request was cancelled.');

				await interaction.editReply({
					embeds: [cancelEmbed],
					components: [],
				});
			}

			collector.stop();
		});

		collector.on('end', async () => {
			if (!message.delete) {
				await message.edit({ components: [] }).catch(() => null);
			}
		});
	},
};
