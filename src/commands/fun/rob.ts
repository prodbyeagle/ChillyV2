import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
	MessageFlags,
} from 'discord.js';
import type { ICommand } from 'types';
import { Api } from 'config/api';
import { branding } from 'config/config';
import { formatLargeNumber } from 'lib/utils';

const robCooldowns: Map<string, number> = new Map();

/**
 * The rob command allows users to steal coins and XP from others.
 */
export const robCommand: ICommand = {
	name: 'rob',
	description: 'Attempt to steal coins and XP from another user.',
	data: new SlashCommandBuilder()
		.setName('rob')
		.setDescription('Attempt to steal coins and XP from another user.')
		.addUserOption((option) =>
			option
				.setName('target')
				.setDescription('The player you want to rob')
				.setRequired(true)
		),

	execute: async (interaction: ChatInputCommandInteraction) => {
		const user = interaction.user;
		const target = interaction.options.getUser('target');

		if (!target || target.id === user.id) {
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle('❌ Robbery Failed')
						.setDescription('You cannot rob yourself!')
						.setColor(branding.AccentColor),
				],
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		const cooldown = robCooldowns.get(user.id);
		if (cooldown && cooldown > Date.now()) {
			const remainingTime = Math.ceil((cooldown - Date.now()) / 1000);
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle('🕰️ Cooldown Active')
						.setDescription(
							`You must wait **${remainingTime}s** before robbing again.`
						)
						.setColor(branding.WarningColor),
				],
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		try {
			const [robberData, targetData] = await Promise.all([
				Api.getPlayer(user.username),
				Api.getPlayer(target.username),
			]);

			if (!robberData || !targetData) {
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle('❌ Robbery Failed')
							.setDescription(
								'One or both players do not have a profile.'
							)
							.setColor(branding.AccentColor),
					],
					flags: MessageFlags.Ephemeral,
				});
				return;
			}

			if (targetData.isbanned) {
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle('❌ Target is Banned')
							.setDescription(
								`You cannot rob **${target.username}** as they are banned.`
							)
							.setColor(branding.AccentColor),
					],
					flags: MessageFlags.Ephemeral,
				});
				return;
			}

			if (!targetData.robberyenabled) {
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle('🔒 Robbery Protection')
							.setDescription(
								`${target.username} has protection enabled and cannot be robbed!`
							)
							.setColor(branding.WarningColor),
					],
					flags: MessageFlags.Ephemeral,
				});
				return;
			}

			if (targetData.balance < 10) {
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle('❌ Not Enough Coins')
							.setDescription(
								`${target.username} has too few coins to rob.`
							)
							.setColor(branding.AccentColor),
					],
					flags: MessageFlags.Ephemeral,
				});
				return;
			}

			const successChance = Math.random() <= 0.5;
			const maxStealPercentage = Math.random() * (0.15 - 0.07) + 0.07;
			const stolenAmount = Math.floor(
				targetData.balance * maxStealPercentage
			);
			const lostAmount = Math.floor(
				robberData.balance * (Math.random() * (0.1 - 0.02) + 0.02)
			);

			const embed = new EmbedBuilder().setTimestamp();

			if (successChance) {
				await target
					.send({
						embeds: [
							new EmbedBuilder()
								.setTitle('💥 Robbery Alert')
								.setDescription(
									`**${
										user.username
									}** just robbed you and stole **${formatLargeNumber(
										stolenAmount
									)}** coins!`
								)
								.setColor(branding.AccentColor),
						],
					})
					.catch(() => {});
			} else {
				await target
					.send({
						embeds: [
							new EmbedBuilder()
								.setTitle('💥 Robbery Attempt')
								.setDescription(
									`**${user.username}** tried to rob you but failed!`
								)
								.setColor(branding.WarningColor),
						],
					})
					.catch(() => {});
			}

			if (successChance) {
				robberData.balance += stolenAmount;
				targetData.balance -= stolenAmount;
				embed
					.setTitle('💰 Successful Robbery')
					.setDescription(
						`You robbed **${
							target.username
						}** and stole 🪙 **${formatLargeNumber(
							stolenAmount
						)}** coins!`
					)
					.setColor(branding.SuccessColor);
			} else {
				robberData.balance -= lostAmount;
				embed
					.setTitle('❌ Robbery Failed')
					.setDescription(
						`You failed to rob ${
							target.username
						} and lost 🪙 **${formatLargeNumber(
							lostAmount
						)}** coins!`
					)
					.setColor(branding.AccentColor);
			}
			robCooldowns.set(user.id, Date.now() + 120000);
			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral,
			});
		} catch (error) {
			console.error('Error in rob command:', error);
		}
	},
};
