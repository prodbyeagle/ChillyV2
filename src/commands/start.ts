import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import type { Command, PlayerData } from '../types';
import { api } from '../config/api';
import { logMessage } from '../events/ready';

export const startCommand: Command = {
	name: 'start',
	description: '✅ Starts a new Character.',
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Starts a new character.'),
	execute: async (interaction: CommandInteraction) => {
		const playerName = interaction.user.username;
		const playerId = interaction.user.id;

		try {
			const existingPlayer = await api.getPlayer(playerName);

			if (existingPlayer) {
				const embed = new EmbedBuilder()
					.setTitle('Character Exists')
					.setDescription('You already have an existing character.')
					.setColor('Red')
					.setTimestamp()
					.setFooter({ text: '🦅 prodbyeagle' });

				await interaction.reply({
					embeds: [embed],
					flags: 'Ephemeral',
				});
				return;
			}

			const newPlayer: PlayerData = {
				id: playerId,
				name: playerName,
				gameStarted: true,
				level: 1,
				xp: 0,
				gold: 100,
				inventory: {},
			};

			const success = await api.createPlayer(newPlayer);

			if (!success) {
				logMessage('Error creating player in the database', 'error');
				await interaction.reply({
					content:
						'An error occurred while starting the game. Please try again later.',
					flags: 'Ephemeral',
				});
				return;
			}

			const welcomeMessages = [
				'🏰 Welcome, {player_name}! Your medieval adventure begins now.',
				'🗡️ Greetings, {player_name}! Prepare to embark on a grand medieval journey.',
				'🏰 Hail, {player_name}! Your medieval saga starts here.',
				'🫅🏻 Welcome, {player_name}! Prepare for an epic journey through the medieval realm.',
				'🏰 Hello, {player_name}! Your medieval adventure awaits.',
				'⚔️ Greetings, {player_name}! Embark on your medieval quest now.',
			];

			const randomMessage = welcomeMessages[
				Math.floor(Math.random() * welcomeMessages.length)
			].replace('{player_name}', playerName);

			const embed = new EmbedBuilder()
				.setTitle('⚔️ Medieval RPG')
				.setDescription(randomMessage)
				.setColor('Random')
				.setTimestamp()
				.setFooter({ text: '🦅 prodbyeagle' });

			await interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
		} catch (error) {
			logMessage(`Error in /start command: ${String(error)}`, 'error');
			await interaction.reply({
				content:
					'An unexpected error occurred while starting the game. Please contact support.',
				flags: 'Ephemeral',
			});
		}
	},
};
