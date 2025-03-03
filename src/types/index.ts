import {
	AutocompleteInteraction,
	CommandInteraction,
	SlashCommandBuilder,
} from 'discord.js';
import { Item } from '../logic/item';

export interface InventoryItem {
	item: Item;
}

export interface Command {
	name: string;
	description: string;
	data: SlashCommandBuilder;
	autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
	execute: (interaction: CommandInteraction) => Promise<void>;
}

export interface PlayerData {
	id: string;
	name: string;
	gameStarted: boolean;
	level: number;
	xp: number;
	gold: number;
	inventory: Record<string, InventoryItem>;
}
