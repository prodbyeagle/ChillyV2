import {
	SlashCommandBuilder,
	EmbedBuilder,
	ChatInputCommandInteraction,
	MessageFlags,
	PermissionFlagsBits,
	PermissionsBitField,
} from 'discord.js';
import type { ICommand } from 'types';
import { Api } from 'config/api';
import { branding } from 'config/config';
import { formatDate } from 'lib/utils';
import { ulid } from 'ulid';

export const eventCommand: ICommand = {
	name: 'event',
	description: 'Manage in-game events like XP and money boosts.',
	data: new SlashCommandBuilder()
		.setName('event')
		.setDescription('Manage in-game events like XP and money boosts.')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Create a new event')
				.addStringOption((option) =>
					option
						.setName('type')
						.setDescription('The type of event: xp or money')
						.setRequired(true)
						.addChoices(
							{ name: 'XP Boost', value: 'xp' },
							{ name: 'Money Boost', value: 'money' }
						)
				)
				.addNumberOption((option) =>
					option
						.setName('multiplier')
						.setDescription('The multiplier for the event')
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName('duration')
						.setDescription('Duration of the event')
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName('end').setDescription('End the current event')
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('current')
				.setDescription('Show the current event')
		),

	execute: async (interaction: ChatInputCommandInteraction) => {
		const subcommand = interaction.options.getSubcommand();

		if (
			interaction.member?.permissions instanceof PermissionsBitField &&
			!interaction.member.permissions.has(
				PermissionFlagsBits.Administrator
			)
		) {
			const embed = new EmbedBuilder()
				.setColor(branding.AccentColor)
				.setTitle('❌ Permission Denied')
				.setDescription(
					'You need administrator permissions to run this command.'
				);

			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		if (subcommand === 'create') {
			const eventType = interaction.options.getString('type') as
				| 'xp'
				| 'money';
			const multiplier = interaction.options.getNumber('multiplier')!;
			const duration = interaction.options.getString('duration')!;
			const timestamp = formatDate(new Date());

			const success = await Api.createEvent({
				id: ulid(),
				type: eventType,
				multiplier,
				duration,
				timestamp: timestamp,
			});
			const embed = new EmbedBuilder()
				.setColor(branding.AccentColor)
				.setTimestamp();

			if (success) {
				embed
					.setTitle(`🎉 New ${eventType} Event Created!`)
					.setDescription(
						`Multiplier: x${multiplier}\nDuration: ${duration}`
					);
			} else {
				embed
					.setTitle('🫸 Warning')
					.setDescription(
						'An event is already active. Please end the current event before creating a new one.'
					);
			}

			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
		} else if (subcommand === 'end') {
			const success = await Api.endEvent();
			const embed = new EmbedBuilder()
				.setColor(branding.AccentColor)
				.setTimestamp();

			if (success) {
				embed
					.setTitle('🎉 Event Ended!')
					.setDescription('The current event has ended.');
			} else {
				embed
					.setTitle('❌ Error')
					.setDescription('No active event found.');
			}

			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
		} else if (subcommand === 'current') {
			const event = await Api.getCurrentEvent();
			const embed = new EmbedBuilder()
				.setColor(branding.AccentColor)
				.setTimestamp();

			if (event) {
				embed
					.setTitle('🎉 Current Event')
					.setDescription(
						`Type: ${event.type}\nMultiplier: x${event.multiplier}\nDuration: ${event.duration}`
					);
			} else {
				embed
					.setTitle('❌ No Active Event')
					.setDescription('No event is currently active.');
			}

			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
