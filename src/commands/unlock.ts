import {
	ChatInputCommandInteraction,
	MessageFlags,
	PermissionsBitField,
	SlashCommandBuilder,
} from 'discord.js';
import type { ICommand } from 'types';

export const unlockCommand: ICommand = {
	name: 'unlock',
	description:
		'Unlocks the channel by enabling send message permissions for everyone.',
	data: new SlashCommandBuilder()
		.setName('unlock')
		.setDescription('Unlocks the channel'),
	execute: async (interaction: ChatInputCommandInteraction) => {
		const channel = interaction.channel;

		if (!channel?.isTextBased()) {
			await interaction.reply({
				content: 'This command can only be used in text channels.',
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		try {
			await channel.edit({
				permissionOverwrites: [
					{
						id: channel.guild.roles.everyone.id,
						allow: [PermissionsBitField.Flags.SendMessages],
					},
				],
			});

			await interaction.reply({
				content:
					'Channel has been unlocked. Everyone can send messages again.',
			});
		} catch (error) {
			await interaction.reply({
				content: `Error unlocking the channel: ${error.message}`,
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
