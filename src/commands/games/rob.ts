import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
	MessageFlags,
} from 'discord.js';
import type { ICommand } from 'types';
import { Api } from 'config/api';
import { branding } from 'config/config';

const robCooldowns: Map<string, number> = new Map();

/**
 * The rob command allows users to steal coins and XP from others.
 */
export const robCommand: ICommand = {
	name: 'rob',
	description: '💰 Attempt to steal coins and XP from another user.',
	data: new SlashCommandBuilder()
		.setName('rob')
		.setDescription('💰 Attempt to steal coins and XP from another user.')
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

		if (robberData.isbanned) {
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle('❌ You are BANNED')
						.setDescription(
							`You are banned! Reason: **${
								robberData.banreason || 'No reason specified'
							}**`
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

		const activeEvent = await Api.getCurrentEvent();
		let eventMultiplier = 1;
		if (activeEvent && activeEvent.type === 'money') {
			eventMultiplier = activeEvent.multiplier;
		}

		const jackpotChance = Math.random() <= 0.0001;
		const successChance = Math.random() <= 0.5;
		const maxStealPercentage = jackpotChance ? 1 : Math.random() * 0.25;
		const stolenAmount = Math.floor(
			targetData.balance * maxStealPercentage * eventMultiplier
		);
		const xpGain = Math.floor(stolenAmount * 0.05);

		let embed = new EmbedBuilder().setTimestamp();

		if (jackpotChance) {
			robberData.balance += targetData.balance;
			targetData.balance = 0;
			embed
				.setTitle('🎉 JACKPOT!')
				.setDescription(
					`OMG! You stole **ALL** of ${target.username}'s 🪙 **${stolenAmount}** coins!`
				)
				.setColor(branding.SuccessColor);
		} else if (successChance) {
			robberData.balance += stolenAmount;
			robberData.experiencepoints += xpGain;
			targetData.balance -= stolenAmount;
			embed
				.setTitle('💰 Successful Robbery')
				.setDescription(
					`You robbed **${target.username}** and stole 🪙 **${stolenAmount}** coins, gaining **${xpGain} XP**!`
				)
				.setColor(branding.SuccessColor);
		} else {
			const lostAmount = Math.floor(
				targetData.balance * Math.random() * 0.25
			);
			robberData.balance -= lostAmount;
			embed
				.setTitle('❌ Robbery Failed')
				.setDescription(
					`You failed to rob ${target.username} and lost 🪙 **${lostAmount}** coins!`
				)
				.setColor(branding.AccentColor);
		}

		await Api.updatePlayer(user.username, user.id, {
			balance: robberData.balance,
			experiencepoints: robberData.experiencepoints,
		});

		await Api.updatePlayer(target.username, target.id, {
			balance: targetData.balance,
		});

		robCooldowns.set(user.id, Date.now() + 120000);

		await interaction.reply({
			embeds: [embed],
			flags: MessageFlags.Ephemeral,
		});
	},
};
