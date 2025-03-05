/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
} from 'discord.js';
import type { ICommand } from 'types';

const commandsPerPage = 5;

const allCommands = [
	{
		name: 'ban',
		description: 'Bans a user by setting their `isbanned` status to true.',
	},
	{ name: 'event', description: 'Handles event-related functionality.' },
	{
		name: 'leaderboard',
		description: 'Shows the leaderboard for the game or activity.',
	},
	{
		name: 'lock',
		description: 'Locks the channel by disabling message sending.',
	},
	{ name: 'profile', description: 'Shows or updates the profile of a user.' },
	{ name: 'rob', description: 'Allows users to rob others in the game.' },
	{
		name: 'unban',
		description:
			'Unbans a user by setting their `isbanned` status to false.',
	},
	{
		name: 'unlock',
		description:
			'Unlocks the channel, allowing users to send messages again.',
	},
	{
		name: 'commands',
		description: 'Shows a list of all available commands with pagination.',
	},
	{ name: 'remindme', description: 'Sets a reminder for the user.' },
	{ name: 'report', description: 'Reports an issue or a user.' },
	{
		name: 'tictactoe',
		description: 'Play a game of Tic Tac Toe with another user.',
	},
	{
		name: 'trivia',
		description: 'Start a trivia game with questions and answers.',
	},
	{ name: 'warn', description: 'Warn a user for inappropriate behavior.' },
];

export const commandsCommand: ICommand = {
	name: 'commands',
	description: 'Shows a list of available commands with pagination.',
	data: new SlashCommandBuilder()
		.setName('commands')
		.setDescription('Displays a list of commands'),

	execute: async (interaction: ChatInputCommandInteraction) => {
		let currentPage = 0;

		const getCommandsEmbed = (page: number) => {
			const startIndex = page * commandsPerPage;
			const selectedCommands = allCommands.slice(
				startIndex,
				startIndex + commandsPerPage
			);

			const embed = new EmbedBuilder()
				.setTitle('Available Commands')
				.setDescription(
					selectedCommands
						.map((cmd) => `**/${cmd.name}** - ${cmd.description}`)
						.join('\n')
				)
				.setFooter({
					text: `Page ${page + 1} of ${Math.ceil(
						allCommands.length / commandsPerPage
					)}`,
				});

			return embed;
		};

		const generateButtons = (page: number) => {
			const buttons = [
				new ButtonBuilder()
					.setCustomId('prev')
					.setLabel('Previous')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(page === 0),

				new ButtonBuilder()
					.setCustomId('next')
					.setLabel('Next')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(
						page ===
							Math.floor(allCommands.length / commandsPerPage)
					),
			];

			return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
		};

		await interaction.reply({
			embeds: [getCommandsEmbed(currentPage)],
			components: [generateButtons(currentPage)],
		});

		const filter = (i: any) => i.user.id === interaction.user.id;

		const collector = interaction.channel!.createMessageComponentCollector({
			filter,
			time: 9999999,
		});

		collector.on('collect', async (buttonInteraction: any) => {
			if (buttonInteraction.customId === 'next') {
				if (
					currentPage <
					Math.floor(allCommands.length / commandsPerPage)
				) {
					currentPage++;
				}
			} else if (buttonInteraction.customId === 'prev') {
				if (currentPage > 0) {
					currentPage--;
				}
			}

			await buttonInteraction.update({
				embeds: [getCommandsEmbed(currentPage)],
				components: [generateButtons(currentPage)],
			});
		});

		collector.on('end', () => {
			// Disable buttons after collector ends
			interaction.editReply({
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId('prev')
							.setLabel('Previous')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(true),
						new ButtonBuilder()
							.setCustomId('next')
							.setLabel('Next')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(true)
					),
				],
			});
		});
	},
};
