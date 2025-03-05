import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
	MessageFlags,
} from 'discord.js';
import { ICommand, IPlayerData } from 'types';
import { Api } from 'config/api';
import { branding } from 'config/config';

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

		try {
			const playerData: IPlayerData | null = await Api.getPlayer(
				playerName
			);

			if (!playerData) {
				const noProfileEmbed = new EmbedBuilder()
					.setColor(branding.AccentColor)
					.setTitle('❌ Profile Not Found')
					.setDescription(`No profile found for **${playerName}**.`)
					.setTimestamp()
					.setFooter({ text: '🦅 prodbyeagle' });

				await interaction.reply({
					embeds: [noProfileEmbed],
					flags: MessageFlags.Ephemeral,
				});
				return;
			}

			const embedColor = playerData.isbanned
				? branding.AccentColor
				: branding.SuccessColor;

			const embed = new EmbedBuilder()
				.setTitle(`📜 ${playerName}'s Profile`)
				.setColor(embedColor)
				.addFields(
					{
						name: '🏆 Level',
						value: `${playerData.currentlevel || 0}`,
						inline: true,
					},
					{
						name: '⭐ XP',
						value: `${playerData.experiencepoints || 0}`,
						inline: true,
					},
					{
						name: '💰 Balance',
						value: `${playerData.balance || 0}`,
						inline: true,
					},
					{
						name: '⚠️ Warnings',
						value: `${playerData.warningcount || 0}`,
						inline: true,
					},
					{
						name: '💬 Messages Sent',
						value: `${playerData.messagessent || 0}`,
						inline: true,
					},
					{
						name: '🎓 Trivia Points',
						value: `${playerData.triviapoints || 0}`,
						inline: true,
					},
					{
						name: '🔓 Robbery Enabled',
						value: playerData.robberyenabled ? '✅ Yes' : '❌ No',
						inline: true,
					},
					{
						name: '🚫 Banned',
						value: playerData.isbanned
							? `✅ Yes (Reason: ${
									playerData.banreason || 'Unknown'
							  })`
							: '❌ No',
						inline: false,
					}
				)
				.setTimestamp()
				.setFooter({ text: '🦅 prodbyeagle' });

			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
		} catch (error) {
			console.error(`Error fetching profile for ${playerName}:`, error);

			const errorEmbed = new EmbedBuilder()
				.setColor(branding.AccentColor)
				.setTitle('❌ Error')
				.setDescription(
					'An error occurred while fetching the profile. Please try again later.'
				)
				.setTimestamp()
				.setFooter({ text: '🦅 prodbyeagle' });

			await interaction.reply({
				embeds: [errorEmbed],
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
