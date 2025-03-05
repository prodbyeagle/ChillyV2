import { branding } from 'config/config';
import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	PermissionFlagsBits,
	PermissionsBitField,
	SlashCommandBuilder,
} from 'discord.js';
import { ICommand } from 'types';

export const lockCommand: ICommand = {
	name: 'lock',
	description:
		'Locks the channel by disabling send message permissions for everyone.',
	data: new SlashCommandBuilder()
		.setName('lock')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription('Locks the channel'),
	execute: async (interaction: ChatInputCommandInteraction) => {
		const channel = interaction.channel;

		if (!channel?.isTextBased()) {
			const embed = new EmbedBuilder()
				.setTitle('❌ Invalid Channel')
				.setDescription(
					'This command can only be used in text channels.'
				)
				.setColor(branding.AccentColor)
				.setTimestamp();

			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		try {
			await channel.edit({
				permissionOverwrites: [
					{
						id: channel.guild.roles.everyone.id,
						deny: [PermissionsBitField.Flags.SendMessages],
					},
				],
			});

			const embed = new EmbedBuilder()
				.setTitle('✅ Channel Locked')
				.setDescription(
					'Channel has been locked. No one can send messages.'
				)
				.setColor(branding.AccentColor)
				.setTimestamp();

			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
		} catch (error) {
			const embed = new EmbedBuilder()
				.setTitle('❌ Error')
				.setDescription(`Error locking the channel: ${error.message}`)
				.setColor(branding.AccentColor)
				.setTimestamp();

			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
