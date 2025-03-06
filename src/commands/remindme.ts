import {
	SlashCommandBuilder,
	EmbedBuilder,
	ChatInputCommandInteraction,
	MessageFlags,
} from 'discord.js';
import type { ICommand } from 'types';
import { branding } from 'config/config';

const parseDuration = (input: string): number | null => {
	const regex = /^(\d+)([smhdwy])$/;
	const match = input.match(regex);
	if (!match) return null;

	const value = parseInt(match[1], 10);
	const unit = match[2];

	const multipliers: Record<string, number> = {
		s: 1000,
		m: 1000 * 60,
		h: 1000 * 60 * 60,
		d: 1000 * 60 * 60 * 24,
		w: 1000 * 60 * 60 * 24 * 7,
		y: 1000 * 60 * 60 * 24 * 365,
	};

	return value * multipliers[unit];
};

export const remindMeCommand: ICommand = {
	name: 'remindme',
	description: 'Set a reminder with a custom message and duration.',
	data: new SlashCommandBuilder()
		.setName('remindme')
		.setDescription('Set a reminder with a custom message and duration.')
		.addStringOption((option) =>
			option
				.setName('text')
				.setDescription('Reminder message')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('time')
				.setDescription('Duration (e.g., 2m, 30d, 5h, 1y, 1s)')
				.setRequired(true)
		),

	execute: async (interaction: ChatInputCommandInteraction) => {
		const text = interaction.options.getString('text', true);
		const timeInput = interaction.options.getString('time', true);

		const duration = parseDuration(timeInput);
		if (duration === null) {
			const embed = new EmbedBuilder()
				.setColor(branding.AccentColor)
				.setTitle('❌ Invalid Time Format')
				.setDescription(
					'Please use a valid time format (e.g., `2m`, `30d`, `5h`, `1y`, `1s`).'
				);

			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		const embed = new EmbedBuilder()
			.setColor(branding.AccentColor)
			.setTitle('⏳ Reminder Set')
			.setDescription(
				`I will remind you in **${timeInput}**.\nMessage: **${text}**`
			);

		await interaction.reply({
			embeds: [embed],
			flags: MessageFlags.Ephemeral,
		});

		setTimeout(async () => {
			const reminderEmbed = new EmbedBuilder()
				.setColor(branding.AccentColor)
				.setTitle('🔔 Reminder!')
				.setDescription(`You asked me to remind you: **${text}**`);

			await interaction.user
				.send({ embeds: [reminderEmbed] })
				.catch(() => {
					interaction.channel?.send({
						content: `<@${interaction.user.id}>`,
						embeds: [reminderEmbed],
					});
				});
		}, duration);
	},
};
