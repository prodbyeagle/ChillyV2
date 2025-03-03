import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import type { Command, InventoryItem } from '../types';
import { api } from '../config/api';

export const inventoryCommand: Command = {
	name: 'inventory',
	description: 'Displays your inventory.',
	data: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('📦 Displays your inventory.'),
	execute: async (interaction: CommandInteraction) => {
		const playerName = interaction.user.username;
		const playerData = await api.getInventory(playerName);
		console.log('Fetched Player Data:', playerData);

		if (!playerData) {
			await interaction.reply({
				content:
					"❌ You don't have a character yet! Use `/start` to begin your adventure.",
				flags: 'Ephemeral',
			});
			return;
		}

		const inventory = playerData ?? {};

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

		for (const [itemId, data] of Object.entries(inventory) as [
			string,
			InventoryItem
		][]) {
			if (data.item.quantity !== undefined) {
				embed.addFields({
					name: `・ ${data.item.name}`,
					value: `x${data.item.quantity}`,
					inline: true,
				});
			}
		}

		await interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
	},
};
