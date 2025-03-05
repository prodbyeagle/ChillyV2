import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
} from 'discord.js';
import { ICommand, IPlayerData } from 'types';
import { api } from 'config/api';

export const profileCommand: ICommand = {
	name: 'profile',
	description: "📜 Displays your profile or another player's profile.",
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription("📜 Displays your profile or another player's profile.")
		.addUserOption((option) =>
			option
				.setName('username')
				.setDescription('The player whose profile you want to view.')
				.setRequired(false)
		),
	execute: async (interaction: ChatInputCommandInteraction) => {
		const targetUser =
			interaction.options.getUser('username') || interaction.user;
		const playerName = targetUser.username;
		const playerData: IPlayerData | null = await api.getPlayer(playerName);

		const embed = new EmbedBuilder()
			.setTitle(`📜 ${playerName}'s Profile`)
			.setColor('#ee2737')
			.addFields(
				{
					name: 'Level',
					value: playerData.currentlevel.toString(),
					inline: true,
				},
				{
					name: 'XP',
					value: playerData.experiencepoints.toString(),
					inline: true,
				},
				{
					name: 'Balance',
					value: playerData.balance.toString(),
					inline: true,
				},
				{
					name: 'Warnings',
					value: playerData.warningcount.toString(),
					inline: true,
				},
				{
					name: 'Messages Sent',
					value: playerData.messagessent.toString(),
					inline: true,
				},
				{
					name: 'Trivia Points',
					value: playerData.triviapoints.toString(),
					inline: true,
				},
				{
					name: 'Robbery Enabled',
					value: playerData.robberyenabled ? 'Yes' : 'No',
					inline: true,
				},
				{
					name: 'Banned',
					value: playerData.isbanned
						? `✅ (Reason: ${playerData.banreason || 'Yes'})`
						: '❌ No',
					inline: true,
				}
			)
			.setTimestamp()
			.setFooter({ text: '🦅 prodbyeagle' });

		await interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
	},
};
