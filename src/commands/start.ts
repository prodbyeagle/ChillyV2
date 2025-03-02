import { CommandInteraction, EmbedBuilder } from 'discord.js';
import type { Command } from '../types';
import { Database } from '../config/db';
import { logMessage } from '../events/ready';

const db = new Database();

export const startCommand: Command = {
	name: 'start',
	description: 'Starts an new Character.',
	execute: async (interaction: CommandInteraction) => {
		const playerName = interaction.user.username;

		try {
			const existingPlayer = await db.getPlayerData(playerName);

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

			const newPlayer = {
				name: playerName,
				gameStarted: true,
				level: 1,
				masteryPoints: 0,
				xp: 0,
				gold: 100,
				lastDailyClaim: 0,
				lastWeeklyClaim: 0,
				lastMonthlyClaim: 0,
				messagesSent: 0,
				clicks: 0,
				petPoints: 0,
				activePets: {},
				pets: {},
				inventory: {},
				masteries: {},
			};

			const success = await db.createPlayer(newPlayer);

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

			const randomMessage =
				welcomeMessages[
					Math.floor(Math.random() * welcomeMessages.length)
				];

			const embed = new EmbedBuilder()
				.setTitle('⚔️ Medieval RPG')
				.setDescription(randomMessage)
				.setColor('Random')
				.setTimestamp()
				.setFooter({ text: '🦅 prodbyeagle' });

			await interaction.reply({ embeds: [embed], ephemeral: true });
		} catch (error) {
			logMessage(`Error in /start command: ${error}`, 'error');
			await interaction.reply({
				content:
					'An unexpected error occurred while starting the game. Please contact support.',
				flags: 'Ephemeral',
			});
		}
	},
};
