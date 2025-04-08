import * as he from 'he';

import { Api } from 'config/api';
import { branding } from 'config/config';

import type { ICommand } from 'types';

import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	EmbedBuilder,
	MessageFlags,
	SlashCommandBuilder,
} from 'discord.js';

export const triviaCommand: ICommand = {
	name: 'trivia',
	description: 'Answer a true/false trivia question to earn coins and XP!',
	data: new SlashCommandBuilder()
		.setName('trivia')
		.setDescription(
			'Answer a true/false trivia question to earn coins and XP!'
		),
	execute: async (interaction: ChatInputCommandInteraction) => {
		try {
			const response = await fetch(
				'https://opentdb.com/api.php?amount=20&type=boolean'
			);
			const data = await response.json();
			if (data.response_code !== 0 || !data.results?.length) {
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle('❌ Trivia Failed')
							.setDescription('Could not fetch trivia questions.')
							.setColor(branding.AccentColor),
					],
					flags: MessageFlags.Ephemeral,
				});
				return;
			}
			const triviaData =
				data.results[Math.floor(Math.random() * data.results.length)];
			// eslint-disable-next-line prefer-const
			let { question, correct_answer } = triviaData;
			question = he.decode(question);

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId('trivia_true')
					.setLabel('True')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('trivia_false')
					.setLabel('False')
					.setStyle(ButtonStyle.Primary)
			);
			const embed = new EmbedBuilder()
				.setTitle('Trivia Time!')
				.setDescription(`**Question:** ${question}`)
				.setColor(branding.AccentColor)
				.setTimestamp();
			await interaction.reply({
				embeds: [embed],
				components: [row],
				flags: MessageFlags.Ephemeral,
			});
			const collector =
				interaction.channel?.createMessageComponentCollector({
					componentType: ComponentType.Button,
					time: 15000,
					filter: (i) => i.user.id === interaction.user.id,
				});
			if (!collector) return;
			collector.on('collect', async (i) => {
				if (
					i.customId !== 'trivia_true' &&
					i.customId !== 'trivia_false'
				)
					return;
				collector.stop();
				const userAnswer =
					i.customId === 'trivia_true' ? 'True' : 'False';
				const isCorrect = userAnswer === correct_answer;
				const resultEmbed = new EmbedBuilder().setTimestamp();
				if (isCorrect) {
					const baseXP = Math.floor(Math.random() * (20 - 10) + 10);
					const baseMoney = Math.floor(
						Math.random() * (50 - 20) + 20
					);
					let xpReward = baseXP;
					let moneyReward = baseMoney;
					const player = await Api.getPlayerByID(interaction.user.id);
					if (!player) {
						await i.update({
							content: 'Player profile not found.',
							components: [],
						});
						return;
					}
					const currentEvent = await Api.getCurrentEvent();
					if (currentEvent) {
						if (currentEvent.type === 'xp')
							xpReward = Math.floor(
								xpReward * currentEvent.multiplier
							);
						if (currentEvent.type === 'money')
							moneyReward = Math.floor(
								moneyReward * currentEvent.multiplier
							);
					}
					await Api.updatePlayer(
						player.username,
						interaction.user.id,
						{
							experiencepoints:
								player.experiencepoints + xpReward,
							balance: player.balance + moneyReward,
							triviapoints: player.triviapoints + 1,
						}
					);
					resultEmbed
						.setTitle('✅ Correct Answer!')
						.setDescription(
							`You earned **${moneyReward}** coins and **${xpReward}** XP!`
						)
						.setColor(branding.SuccessColor);
				} else {
					resultEmbed
						.setTitle('❌ Wrong Answer')
						.setDescription(
							`The correct answer was **${correct_answer}**.`
						)
						.setColor(branding.AccentColor);
				}
				await i.update({
					embeds: [resultEmbed],
					components: [],
				});
			});
			collector.on('end', async (collected, reason) => {
				if (reason === 'time' && collected.size === 0) {
					const timeoutEmbed = new EmbedBuilder()
						.setTitle('⌛ Time Expired')
						.setDescription('You did not answer in time.')
						.setColor(branding.AccentColor)
						.setTimestamp();
					await interaction.editReply({
						embeds: [timeoutEmbed],
						components: [],
					});
				}
			});
		} catch (error) {
			console.error('Error in trivia command:', error);
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle('❌ Trivia Failed')
						.setDescription(
							'An error occurred while fetching trivia questions.'
						)
						.setColor(branding.AccentColor),
				],
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
