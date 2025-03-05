import {
	ChatInputCommandInteraction,
	MessageFlags,
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
		.setDescription('Locks the channel'),
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
						deny: [PermissionsBitField.Flags.SendMessages],
					},
				],
			});

			await interaction.reply({
				content: 'Channel has been locked. No one can send messages.',
			});
		} catch (error) {
			await interaction.reply({
				content: `Error locking the channel: ${error.message}`,
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
