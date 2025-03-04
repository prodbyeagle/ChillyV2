import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} from 'discord.js';
import type { Command, GameData } from '../../types';
import { api } from '../../config/api';
import { logMessage } from '../../events/ready';

export const clickerCommand: Command = {
	name: 'clicker',
	description: '🗿 Click the button to earn rewards!',
	data: new SlashCommandBuilder()
		.setName('clicker')
		.setDescription('Click to gain XP, gold, and special bonuses!'),
	execute: async (interaction: CommandInteraction) => {
		const playerName = interaction.user.username;
		const gameKey = 'chillyrpg_clicker';

		try {
			let gameData: GameData | null = await api.getGameData(playerName);

			if (!gameData) {
				gameData = {
					clicker: {
						clicks: 0,
						streak: 0,
						multiplier: 1,
						lastClickTimestamp: 0,
					},
				};
				await api.updateGameData(playerName, gameData);
			}
			const gainedClicks = 1;
			const newClickCount = gameData.clicker.clicks + gainedClicks;

			await api.updateGameData(playerName, {
				clicker: { ...gameData.clicker, clicks: newClickCount },
			});

			const embed = new EmbedBuilder()
				.setTitle(`Chilly Clicker - ${playerName}`)
				.setDescription(`**Total Clicks:** \`${newClickCount}\``)
				.setColor('Random')
				.setTimestamp()
				.setFooter({ text: '🦅 prodbyeagle' });

			const clickButton = new ButtonBuilder()
				.setCustomId('click_button')
				.setLabel('+1 Click')
				.setStyle(ButtonStyle.Primary);

			const actionRow =
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					clickButton
				);

			await interaction.reply({
				embeds: [embed],
				components: [actionRow],
				flags: 'Ephemeral',
			});
		} catch (error) {
			logMessage(`Error in /clicker command: ${String(error)}`, 'error');
			await interaction.reply({
				content:
					'An unexpected error occurred. Please try again later.',
				flags: 'Ephemeral',
			});
		}
	},
};
