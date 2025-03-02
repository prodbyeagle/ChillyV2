import { CommandInteraction, EmbedBuilder } from 'discord.js';
import type { Command } from '../types';
import { Database } from '../config/db';

export const inventoryCommand: Command = {
	name: 'inventory',
	description: '📦 Displays your inventory.',
	execute: async (interaction: CommandInteraction) => {
		const db = new Database();
		const playerName = interaction.user.username;
		const playerData = await db.getPlayerData(playerName);

		if (!playerData) {
			await interaction.reply({
				content:
					"❌ You don't have a character yet! Use `/start` to begin your adventure.",
				flags: 'Ephemeral',
			});
			return;
		}

		const inventory = playerData.inventory ?? {};

		if (Object.keys(inventory).length === 0) {
			await interaction.reply({
				content:
					'📦 Your inventory is empty! Start collecting items on your adventure.',
				flags: 'Ephemeral',
			});
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle(`📦 ${playerName}'s Inventory`)
			.setDescription('Here are the items you have collected:')
			.setColor(0x0099ff)
			.setFooter({ text: '🦅 prodbyeagle' });

		for (const [item, count] of Object.entries(inventory)) {
			embed.addFields({
				name: `• ${item}`,
				value: `x${count}`,
				inline: true,
			});
		}

		await interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
	},
};
