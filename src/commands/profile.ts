import {
	CommandInteraction,
	CommandInteractionOptionResolver,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import { Command, PlayerData } from '../types';
import { api } from '../config/api';

export const profileCommand: Command = {
	name: 'profile',
	description: "📜 Displays your profile or another player's profile.",
	// @ts-ignore
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription("📜 Displays your profile or another player's profile.")
		.addUserOption((option) =>
			option
				.setName('username')
				.setDescription('The player whose profile you want to view.')
				.setRequired(false)
		),
	execute: async (interaction: CommandInteraction) => {
		const options = interaction.options as CommandInteractionOptionResolver;
		const targetUser = options.getUser('username') || interaction.user;
		const playerName = targetUser.username;
		const playerData: PlayerData | null = await api.getPlayer(playerName);

		if (!playerData) {
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: `❌ No profile found for **${playerName}**. They may need to use \`/start\` first.`,
					flags: 'Ephemeral',
				});
			} else {
				await interaction.reply({
					content: `❌ No profile found for **${playerName}**. They may need to use \`/start\` first.`,
					flags: 'Ephemeral',
				});
			}
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle(`📜 ${playerName}'s Profile`)
			.setColor(0x00aaff)
			.addFields(
				{
					name: '🔹 Level',
					value: playerData.level.toString(),
					inline: true,
				},
				{
					name: '🌟 XP',
					value: playerData.xp.toString(),
					inline: true,
				},
				{
					name: '💰 Gold',
					value: playerData.gold.toString(),
					inline: true,
				},
			)
			.setTimestamp()
			.setFooter({ text: '🦅 prodbyeagle' });

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ embeds: [embed], flags: 'Ephemeral' });
		} else {
			await interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
		}
	},
};
