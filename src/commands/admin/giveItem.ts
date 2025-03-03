import {
	CommandInteraction,
	AutocompleteInteraction,
	CacheType,
	SlashCommandBuilder,
	CommandInteractionOptionResolver,
} from 'discord.js';
import { allItems } from '../../data/items';
import type { Command, PlayerData } from '../../types';
import { api } from '../../config/api';

export const giveItemCommand: Command = {
	name: 'giveitem',
	description: 'Give an item to a player.',
	//! cant remove error. but it works tho
	// @ts-ignore
	data: new SlashCommandBuilder()
		.setName('giveitem')
		.setDescription('Give an item to a player.')
		.addUserOption((option) =>
			option
				.setName('player')
				.setDescription('Player to give the item to.')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('itemname')
				.setDescription('Item to give.')
				.setRequired(true)
				.setAutocomplete(true)
		)
		.addIntegerOption((option) =>
			option
				.setName('quantity')
				.setDescription('Quantity of the item.')
				.setRequired(true)
		),

	async autocomplete(interaction: AutocompleteInteraction) {
		const focusedValue = interaction.options.getFocused().toLowerCase();
		const filteredItems = allItems
			.filter((item) => item.name.toLowerCase().includes(focusedValue))
			.slice(0, 25);

		await interaction.respond(
			filteredItems.map((item) => ({
				name: item.name,
				value: item.id,
			}))
		);
	},

	async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
		const options = interaction.options as CommandInteractionOptionResolver;

		const player = options.getUser('player', true);
		const itemId = options.getString('itemname', true);
		const quantity = options.getInteger('quantity', true);

		const item = allItems.find((i) => i.id === itemId);
		if (!item) {
			await interaction.reply({
				content: 'Item not found.',
				flags: 'Ephemeral',
			});
			return;
		}

		const playerData: PlayerData | null = await api.getPlayer(
			player.username
		);
		if (!playerData) {
			await interaction.reply({
				content: 'Player data not found.',
				flags: 'Ephemeral',
			});
			return;
		}

		const newInventory = { ...playerData.inventory };

		if (!newInventory[itemId]) {
			newInventory[itemId] = {
				item: item,
			};
		}

		newInventory[itemId].item.quantity += quantity;

		if (newInventory[itemId].item.quantity > item.maxStack) {
			newInventory[itemId].item.quantity = item.maxStack;
		}

		playerData.inventory = newInventory;

		const success = await api.updatePlayer(player.username, playerData);

		if (!success) {
			await interaction.reply({
				content:
					"❌ There was an error updating the player's inventory.",
				flags: 'Ephemeral',
			});
			return;
		}

		await interaction.reply({
			content: `${quantity} ${item.name}(s) have been added to ${player.username}'s inventory.`,
			flags: 'Ephemeral',
		});
	},
};
