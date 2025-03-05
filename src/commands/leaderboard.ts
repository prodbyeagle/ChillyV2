import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
	MessageFlags,
} from 'discord.js';
import { ICommand, IPlayerData } from 'types';
import { Api } from 'config/api';
import { branding } from 'config/config';
import { formatLargeNumber } from 'lib/utils';

/**
 * Fetches and displays the leaderboard based on the selected category.
 */
export const leaderboardCommand: ICommand = {
	name: 'leaderboard',
	description:
		'View the top 10 players based on Level, Messages Sent, or Balance.',
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription(
			'View the top 10 players based on Level, Messages Sent, or Balance.'
		)
		.addStringOption((option) =>
			option
				.setName('category')
				.setDescription('Choose the leaderboard category')
				.setRequired(true)
				.addChoices(
					{ name: 'Level', value: 'currentlevel' },
					{ name: 'Messages Sent', value: 'messagessent' },
					{ name: 'Money', value: 'balance' }
				)
		),

	execute: async (interaction: ChatInputCommandInteraction) => {
		const category = interaction.options.getString('category', true);
		const categoryNames: { [key: string]: string } = {
			currentlevel: 'Level',
			messagessent: 'Messages Sent',
			balance: 'Balance',
		};

		try {
			const players: IPlayerData[] = await Api.getAllPlayers();

			if (!players.length) {
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(
								`🏆 ${categoryNames[category]} Leaderboard`
							)
							.setDescription(
								'No players found in this category!'
							)
							.setColor(branding.InfoColor),
					],
					flags: MessageFlags.Ephemeral,
				});
				return;
			}

			const sortedPlayers = players
				.filter((p) => p[category] !== undefined)
				.sort(
					(a, b) => (b[category] as number) - (a[category] as number)
				)
				.slice(0, 10);

			const embed = new EmbedBuilder()
				.setTitle(`🏆 ${categoryNames[category]} Leaderboard`)
				.setColor(branding.AccentColor)
				.setFooter({ text: '🦅 prodbyeagle' });

			const leaderboardText = sortedPlayers
				.map((player, index) => {
					const rankEmojis = ['🥇', '🥈', '🥉'];
					const rank = index + 1;
					const rankEmoji =
						rank <= 3 ? rankEmojis[rank - 1] : `#${rank}`;
					return `${rankEmoji} <@${player.userid}> - **${formatLargeNumber(player[category])}**`;
				})
				.join('\n');

			embed.setDescription(leaderboardText);

			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
		} catch (error) {
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle('❌ Error')
						.setDescription(
							'An error occurred while fetching the leaderboard.'
						)
						.setColor(branding.AccentColor),
				],
				flags: MessageFlags.Ephemeral,
			});
			console.log(error);
		}
	},
};
